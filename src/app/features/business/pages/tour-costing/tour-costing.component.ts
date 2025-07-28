import {
  Component,
  OnInit,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// SỬA LỖI: Thêm 'Observable' vào import
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
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-tour-costing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CurrencyVndPipe],
  templateUrl: './tour-costing.component.html',
})
export class TourCostingComponent implements OnInit {
  // --- Injections ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private tourPaxService = inject(TourPaxService);

  // --- Component State using Signals ---
  public tourId!: number;
  public tourDetail$!: Observable<TourDetail>;

  public services: WritableSignal<ServiceBreakdownDTO[]> = signal([]);
  public paxConfigs: WritableSignal<TourPaxFullDTO[]> = signal([]);

  public isLoading = signal(true);
  public isCalculating = signal(false);

  public isPaxModalOpen = signal(false);
  public currentPax: WritableSignal<TourPaxFullDTO | null> = signal(null);

  // --- Forms ---
  public costingForm: FormGroup;
  public paxForm: FormGroup;

  constructor() {
    this.costingForm = this.fb.group({
      profitRate: [10, [Validators.required, Validators.min(0)]],
      extraCost: [0, [Validators.required, Validators.min(0)]],
    });

    this.paxForm = this.fb.group({
      minQuantity: ['', [Validators.required, Validators.min(1)]],
      maxQuantity: ['', [Validators.required, Validators.min(1)]],
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
          // Giả sử tourService.getTourById trả về một cấu trúc có thuộc tính 'detail'
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
          // Simple feedback, can be replaced with a toast notification
          alert('Đã tính toán và cập nhật giá thành công!');
        },
        error: (err) => {
          console.error('Lỗi khi tính giá:', err);
          alert(`Lỗi: ${err.error?.message || 'Không thể tính giá.'}`);
        },
      });
  }

  // --- Pax Modal Logic ---
  openPaxModal(pax: TourPaxFullDTO | null): void {
    this.currentPax.set(pax);
    if (pax) {
      this.paxForm.patchValue({
        minQuantity: pax.minQuantity,
        maxQuantity: pax.maxQuantity,
      });
    } else {
      this.paxForm.reset();
    }
    this.isPaxModalOpen.set(true);
  }

  closePaxModal(): void {
    this.isPaxModalOpen.set(false);
    this.currentPax.set(null);
  }

  handlePaxSave(): void {
    if (this.paxForm.invalid) return;

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
        this.loadData().subscribe(); // Reload data on success
      },
      error: (err) => {
        console.error('Lỗi khi lưu khoảng khách:', err);
        alert(`Lỗi: ${err.error?.message || 'Không thể lưu.'}`);
      },
    });
  }

  handlePaxDelete(paxId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa khoảng khách này?')) {
      this.tourPaxService.deleteTourPax(this.tourId, paxId).subscribe({
        next: () => {
          this.loadData().subscribe();
        },
        error: (err) => {
          console.error('Lỗi khi xóa khoảng khách:', err);
          alert(`Lỗi: ${err.error?.message || 'Không thể xóa.'}`);
        },
      });
    }
  }
}
