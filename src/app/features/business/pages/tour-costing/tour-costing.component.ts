import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  Signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TourPaxService } from '../../../../core/services/tour-pax.service';
import { TourService } from '../../../../core/services/tour.service';
import {
  ServiceBreakdownDTO,
  TourCostSummary,
  TourPaxFullDTO,
  TourPaxRequestDTO,
  TourDetail,
} from '../../../../core/models/tour.model';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tour-costing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyVndPipe],
  templateUrl: './tour-costing.component.html',
})
export class TourCostingComponent implements OnInit {
  // --- Injections ---
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private tourPaxService = inject(TourPaxService);
  private tourService = inject(TourService);
  private toastr = inject(ToastrService);

  // --- Component State ---
  tourId!: number;
  tourDetail = signal<TourDetail | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);

  // --- Source of Truth Signals (Dữ liệu gốc) ---
  services = signal<ServiceBreakdownDTO[]>([]);
  paxConfigs = signal<TourPaxFullDTO[]>([]);
  costSummary = signal<TourCostSummary | null>(null);

  // --- Form & Modal State ---
  paxForm!: FormGroup;
  priceToolForm!: FormGroup;
  isEditMode = signal(false);
  currentPaxId = signal<number | null>(null);

  // --- FIX: Khai báo signal ở đây, nhưng sẽ khởi tạo trong constructor ---
  priceToolValues!: Signal<{ profitRate: number; extraCost: number }>;

  // --- Computed Signals for Display (Tín hiệu được tính toán để hiển thị) ---
  groupedServices = computed(() => {
    const groups: {
      [key: string]: { services: ServiceBreakdownDTO[]; total: number };
    } = {};
    this.services().forEach((service) => {
      if (!groups[service.serviceTypeName]) {
        groups[service.serviceTypeName] = { services: [], total: 0 };
      }
      groups[service.serviceTypeName].services.push(service);
      groups[service.serviceTypeName].total += service.nettPrice;
    });
    return Object.entries(groups).map(([name, data]) => ({ name, ...data }));
  });

  totalServiceCost = computed(() =>
    this.groupedServices().reduce((total, group) => total + group.total, 0)
  );

  paxConfigsWithPreview = computed(() => {
    const paxes = this.paxConfigs();
    const summary = this.costSummary();
    // FIX: Lấy giá trị từ signal đã được khởi tạo an toàn
    const toolValues = this.priceToolValues
      ? this.priceToolValues()
      : { profitRate: 10, extraCost: 0 };

    if (!summary || !this.priceToolForm?.valid) {
      return paxes.map((pax) => ({
        ...pax,
        previewSellingPrice: pax.sellingPrice ?? 0,
      }));
    }

    const { profitRate, extraCost } = toolValues;

    return paxes.map((pax) => {
      if (pax.manualPrice) {
        return {
          ...pax,
          previewSellingPrice: pax.sellingPrice ?? 0,
          fixedPrice: pax.fixedPrice,
        };
      }
      const paxCount = pax.maxQuantity;
      if (paxCount === 0)
        return { ...pax, previewSellingPrice: 0, fixedPrice: 0 };

      const costPerPax =
        summary.totalFixedCost / paxCount + summary.totalPerPersonCost;
      const previewPrice = costPerPax * (1 + profitRate / 100) + extraCost;

      return {
        ...pax,
        previewSellingPrice: previewPrice,
        fixedPrice: costPerPax,
      };
    });
  });

  constructor() {
    // --- FIX: Sắp xếp lại thứ tự khởi tạo ---
    // 1. Tạo các form trước tiên
    this.priceToolForm = this.fb.group({
      profitRate: [10, [Validators.required, Validators.min(0)]],
      extraCost: [0, [Validators.required, Validators.min(0)]],
    });

    this.paxForm = this.fb.group(
      {
        minQuantity: [1, [Validators.required, Validators.min(1)]],
        maxQuantity: [null, [Validators.required, Validators.min(1)]],
        manualPrice: [false, Validators.required],
        fixedPrice: [{ value: null, disabled: true }],
        sellingPrice: [{ value: null, disabled: true }],
      },
      { validators: [this.formValidator(), this.priceValidator()] }
    );

    // 2. Sau khi form đã tồn tại, khởi tạo các thuộc tính phụ thuộc vào nó
    this.priceToolValues = toSignal(this.priceToolForm.valueChanges, {
      initialValue: this.priceToolForm.value,
    });

    // 3. Gọi các phương thức phụ thuộc vào form
    this.onManualPriceChange();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.tourId = +idParam;
      this.loadData();
    }
    // Không cần gọi onManualPriceChange() ở đây nữa
  }

  loadData(): void {
    this.isLoading.set(true);
    forkJoin({
      tourDetail: this.tourService.getTourById(this.tourId),
      services: this.tourPaxService.getServiceBreakdown(this.tourId),
      paxConfigs: this.tourPaxService.getTourPaxConfigurations(this.tourId),
      costSummary: this.tourPaxService.getTourCostSummary(this.tourId),
    }).subscribe({
      next: ({ tourDetail, services, paxConfigs, costSummary }) => {
        this.tourDetail.set(tourDetail.detail);
        this.services.set(services);
        this.paxConfigs.set(paxConfigs);
        this.costSummary.set(costSummary);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.toastr.error('Tải dữ liệu thất bại!', 'Lỗi');
      },
    });
  }

  onManualPriceChange(): void {
    this.paxForm.get('manualPrice')?.valueChanges.subscribe((isManual) => {
      const fixedPriceControl = this.paxForm.get('fixedPrice');
      const sellingPriceControl = this.paxForm.get('sellingPrice');
      if (isManual) {
        fixedPriceControl?.enable();
        sellingPriceControl?.enable();
      } else {
        fixedPriceControl?.disable();
        sellingPriceControl?.disable();
      }
    });
  }

  openPaxModal(pax?: TourPaxFullDTO): void {
    if (pax) {
      this.isEditMode.set(true);
      this.currentPaxId.set(pax.id);
      this.paxForm.patchValue(pax);
    } else {
      this.isEditMode.set(false);
      this.currentPaxId.set(null);
      this.paxForm.reset({
        minQuantity: 1,
        maxQuantity: null,
        manualPrice: false,
        fixedPrice: null,
        sellingPrice: null,
      });
    }
    const modal = document.getElementById('pax-modal') as HTMLDialogElement;
    modal?.showModal();
  }

  closePaxModal(): void {
    const modal = document.getElementById('pax-modal') as HTMLDialogElement;
    modal?.close();
  }

  savePax(): void {
    if (this.paxForm.invalid) {
      this.paxForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const formData: TourPaxRequestDTO = this.paxForm.getRawValue();

    const operation = this.isEditMode()
      ? this.tourPaxService.updateTourPax(
          this.tourId,
          this.currentPaxId()!,
          formData
        )
      : this.tourPaxService.createTourPax(this.tourId, formData);

    operation.subscribe({
      next: () => {
        this.loadData();
        this.toastr.success('Lưu khoảng khách thành công!', 'Thành công');
        this.closePaxModal();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra', 'Lỗi');
      },
      complete: () => this.isSubmitting.set(false),
    });
  }

  deletePax(paxId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa khoảng khách này?')) {
      this.tourPaxService.deleteTourPax(this.tourId, paxId).subscribe({
        next: () => {
          this.paxConfigs.update((paxes) =>
            paxes.filter((p) => p.id !== paxId)
          );
          this.toastr.success('Xóa thành công!', 'Thành công');
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Xóa thất bại', 'Lỗi');
        },
      });
    }
  }

  applyAndSaveAllPrices(): void {
    if (this.priceToolForm.invalid) return;
    this.isSubmitting.set(true);
    const { profitRate, extraCost } = this.priceToolForm.value;

    this.tourPaxService
      .calculatePrices(this.tourId, { profitRate, extraCost })
      .subscribe({
        next: (res) => {
          this.paxConfigs.set(res);
          this.toastr.success(
            'Đã cập nhật giá cho toàn bộ tour!',
            'Thành công'
          );
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Cập nhật giá thất bại', 'Lỗi');
        },
        complete: () => this.isSubmitting.set(false),
      });
  }

  private formValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const min = group.get('minQuantity')?.value;
      const max = group.get('maxQuantity')?.value;

      if (min !== null && max !== null && min > max) {
        return { minMax: true };
      }

      const existingPaxes = this.paxConfigs();
      const currentId = this.currentPaxId();

      const isOverlapping = existingPaxes
        .filter((p) => p.id !== currentId)
        .some(
          (pax) =>
            (min >= pax.minQuantity && min <= pax.maxQuantity) ||
            (max >= pax.minQuantity && max <= pax.maxQuantity) ||
            (min < pax.minQuantity && max > pax.maxQuantity)
        );

      if (isOverlapping) {
        return { overlap: true };
      }
      return null;
    };
  }

  // --- Price Validator ---
  private priceValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const isManual = formGroup.get('manualPrice')?.value;
      const fixedPrice = formGroup.get('fixedPrice')?.value;
      const sellingPrice = formGroup.get('sellingPrice')?.value;

      // Chỉ validate khi người dùng chọn "Tự nhập giá" và đã nhập cả 2 giá trị
      if (isManual && fixedPrice !== null && sellingPrice !== null) {
        if (fixedPrice > sellingPrice) {
          // Trả về một object lỗi nếu giá bán nhỏ hơn giá vốn
          return { priceInvalid: true };
        }
      }
      // Trả về null nếu không có lỗi
      return null;
    };
  }
}
