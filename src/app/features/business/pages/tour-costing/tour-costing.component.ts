import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  Signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin, of, Observable } from 'rxjs';
import { switchMap, tap, finalize, map } from 'rxjs/operators';

import { TourService } from '../../../../core/services/tour.service';
import { TourPaxService } from '../../../../core/services/tour-pax.service';
import {
  ServiceBreakdownDTO,
  TourDetail,
  TourPaxFullDTO,
  TourPaxRequestDTO,
} from '../../../../core/models/tour.model';

// COMMENT: Interface để định nghĩa cấu trúc dữ liệu đã được gom nhóm, giúp hiển thị thông minh hơn.
interface GroupedService {
  serviceTypeName: string;
  services: ServiceBreakdownDTO[];
  totalNettPrice: number;
}

@Component({
  selector: 'app-tour-costing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CurrencyPipe,
    // COMMENT: Không cần import PaxFormComponent nữa vì đã hợp nhất logic vào đây.
  ],
  templateUrl: './tour-costing.component.html',
})
export class TourCostingComponent implements OnInit {
  // --- Injections ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private tourPaxService = inject(TourPaxService);

  // --- Component State ---
  public tourId!: number;
  public tourDetail$!: Observable<TourDetail>;

  public services = signal<ServiceBreakdownDTO[]>([]);
  public paxConfigs = signal<TourPaxFullDTO[]>([]);
  public isLoading = signal(true);
  public isCalculating = signal(false);

  // --- Modal State (trước đây nằm trong pax-form.component) ---
  public isPaxModalOpen = signal(false);
  public currentPax = signal<TourPaxFullDTO | null>(null);

  // COMMENT: Signal được tính toán (computed signal) để tự động gom nhóm dịch vụ mỗi khi danh sách dịch vụ thay đổi.
  public groupedServices: Signal<GroupedService[]> = computed(() => {
    const services = this.services();
    if (!services.length) return [];

    const groups = new Map<
      string,
      { services: ServiceBreakdownDTO[]; totalNettPrice: number }
    >();

    for (const service of services) {
      if (!groups.has(service.serviceTypeName)) {
        groups.set(service.serviceTypeName, {
          services: [],
          totalNettPrice: 0,
        });
      }
      const group = groups.get(service.serviceTypeName)!;
      group.services.push(service);
      group.totalNettPrice += service.nettPrice;
    }

    return Array.from(groups.entries()).map(([serviceTypeName, data]) => ({
      serviceTypeName,
      ...data,
    }));
  });

  public totalServiceCost = computed(() =>
    this.groupedServices().reduce(
      (total, group) => total + group.totalNettPrice,
      0
    )
  );

  // --- Forms ---
  public costingForm: FormGroup;
  public paxForm: FormGroup; // Form này trước đây nằm trong pax-form.component

  constructor() {
    this.costingForm = this.fb.group({
      profitRate: [10, [Validators.required, Validators.min(0)]],
      extraCost: [0, [Validators.required, Validators.min(0)]],
    });

    // NÂNG CẤP: Thêm các trường giá vào form để cho phép chỉnh sửa thủ công.
    this.paxForm = this.fb.group({
      minQuantity: [1, [Validators.required, Validators.min(1)]],
      maxQuantity: [1, [Validators.required, Validators.min(1)]],
      fixedPrice: [null],
      sellingPrice: [null],
    });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => {
          const id = params.get('id');
          if (!id) {
            this.router.navigate(['/business/tour-list']);
            return;
          }
          this.tourId = +id;
          this.tourDetail$ = this.tourService
            .getTourById(this.tourId)
            .pipe(map((res: any) => res.detail));
        }),
        switchMap(() => this.loadData())
      )
      .subscribe();
  }

  loadData() {
    this.isLoading.set(true);
    return forkJoin({
      services: this.tourPaxService.getServiceBreakdown(this.tourId),
      paxConfigs: this.tourPaxService.getTourPaxConfigurations(this.tourId),
    }).pipe(
      tap(({ services, paxConfigs }) => {
        this.services.set(services);
        this.paxConfigs.set(paxConfigs);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  calculatePrices(): void {
    if (this.costingForm.invalid) return;

    this.isCalculating.set(true);
    this.tourPaxService
      .calculatePrices(this.tourId, this.costingForm.value)
      .pipe(finalize(() => this.isCalculating.set(false)))
      .subscribe({
        next: (updatedConfigs) => {
          this.paxConfigs.set(updatedConfigs);
          alert('Đã tính toán và cập nhật giá thành công!');
        },
        error: (err) =>
          alert(`Lỗi: ${err.error?.message || 'Không thể tính giá.'}`),
      });
  }

  // --- Pax Modal Logic (trước đây nằm trong pax-form.component) ---
  openPaxModal(pax: TourPaxFullDTO | null): void {
    this.currentPax.set(pax);
    if (pax) {
      // NÂNG CẤP: Cập nhật giá trị cho các trường giá khi mở modal sửa.
      this.paxForm.patchValue({
        minQuantity: pax.minQuantity,
        maxQuantity: pax.maxQuantity,
        fixedPrice: pax.fixedPrice,
        sellingPrice: pax.sellingPrice,
      });
    } else {
      this.paxForm.reset({ minQuantity: 1, maxQuantity: 1 });
    }
    this.isPaxModalOpen.set(true);
  }

  closePaxModal(): void {
    this.isPaxModalOpen.set(false);
    this.currentPax.set(null);
  }

  handlePaxSave(): void {
    if (this.paxForm.invalid) {
      this.paxForm.markAllAsTouched();
      return;
    }
    if (this.paxForm.value.minQuantity > this.paxForm.value.maxQuantity) {
      alert('Số khách tối thiểu không được lớn hơn số khách tối đa.');
      return;
    }

    const formData: TourPaxRequestDTO = this.paxForm.value;
    const currentPaxData = this.currentPax();

    const saveObservable = currentPaxData
      ? this.tourPaxService.updateTourPax(
          this.tourId,
          currentPaxData.id,
          formData
        )
      : this.tourPaxService.createTourPax(this.tourId, formData);

    saveObservable.subscribe({
      next: () => {
        this.closePaxModal();
        this.loadData().subscribe();
      },
      error: (err) => alert(`Lỗi: ${err.error?.message || 'Không thể lưu.'}`),
    });
  }

  handlePaxDelete(paxId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa khoảng khách này?')) {
      this.tourPaxService.deleteTourPax(this.tourId, paxId).subscribe({
        next: () => {
          this.loadData().subscribe();
        },
        error: (err) => alert(`Lỗi: ${err.error?.message || 'Không thể xóa.'}`),
      });
    }
  }
}
