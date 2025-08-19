import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  TemplateRef,
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

// NG-ZORRO Imports
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-tour-costing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CurrencyVndPipe,
    // --- NZ-ZORRO ---
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzSpinModule,
    NzCardModule,
    NzGridModule,
    NzAlertModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzTagModule,
    NzIconModule,
  ],
  templateUrl: './tour-costing.component.html',
})
export class TourCostingComponent implements OnInit {
  // --- Injections ---
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private tourPaxService = inject(TourPaxService);
  private tourService = inject(TourService);
  private modalService = inject(NzModalService);
  private message = inject(NzMessageService);

  // --- Component State ---
  tourId!: number;
  tourDetail = signal<TourDetail | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);

  // --- Source of Truth Signals ---
  services = signal<ServiceBreakdownDTO[]>([]);
  paxConfigs = signal<TourPaxFullDTO[]>([]);
  costSummary = signal<TourCostSummary | null>(null);

  // --- Form State ---
  paxForm!: FormGroup;
  priceToolForm!: FormGroup;
  isEditMode = signal(false);
  currentPaxId = signal<number | null>(null);

  // --- FIX: Add formatter and parser for currency input ---
  formatterVND = (value: number | null): string =>
    value ? `${value.toLocaleString('vi-VN')} đ` : '';
  // --- FIX: parserVND must return a number ---
  parserVND = (value: string): number =>
    Number(value.replace(/\s?đ/g, '').replace(/,/g, ''));

  // --- Computed Signals for Display ---
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
    const toolValues = this.priceToolForm.value;

    if (!summary || !this.priceToolForm.valid) {
      return paxes.map((pax) => ({
        ...pax,
        previewSellingPrice: pax.sellingPrice ?? 0,
        costPerPax: pax.fixedPrice ?? 0,
      }));
    }

    const { profitRate, extraCost } = toolValues;

    return paxes.map((pax) => {
      const costPerPax =
        summary.totalFixedCost / pax.maxQuantity + summary.totalPerPersonCost;
      let previewPrice = pax.sellingPrice ?? 0;

      if (!pax.manualPrice) {
        previewPrice = costPerPax * (1 + profitRate / 100) + extraCost;
      }

      return {
        ...pax,
        previewSellingPrice: previewPrice,
        costPerPax: costPerPax,
      };
    });
  });

  constructor() {
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
      {
        validators: [
          this.minMaxValidator(),
          this.overlapValidator(),
          this.priceValidator(),
        ],
      }
    );

    this.onManualPriceChange();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.tourId = +idParam;
      this.loadData();
    }
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
        this.message.error('Tải dữ liệu thất bại!');
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
        fixedPriceControl?.reset();
        sellingPriceControl?.reset();
      }
    });
  }

  openPaxModal(paxModalTpl: TemplateRef<{}>, pax?: TourPaxFullDTO): void {
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
        fixedPrice: { value: null, disabled: true },
        sellingPrice: { value: null, disabled: true },
      });
    }

    this.modalService.create({
      nzTitle: this.isEditMode()
        ? 'Chỉnh Sửa Khoảng Khách'
        : 'Thêm Khoảng Khách Mới',
      nzContent: paxModalTpl,
      nzFooter: [
        {
          label: 'Hủy',
          onClick: () => this.modalService.closeAll(),
        },
        {
          label: 'Lưu',
          type: 'primary',
          loading: this.isSubmitting(),
          disabled: () => this.paxForm.invalid,
          onClick: () => this.savePax(),
        },
      ],
      nzMaskClosable: false,
      nzWidth: '600px',
    });
  }

  savePax(): void {
    if (this.paxForm.invalid) {
      Object.values(this.paxForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
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
        this.loadData(); // Tải lại toàn bộ dữ liệu để đồng bộ
        this.message.success('Lưu khoảng khách thành công!');
        this.modalService.closeAll();
      },
      error: (err) => {
        console.error(err);
        this.message.error(err.error?.message || 'Có lỗi xảy ra');
      },
      complete: () => this.isSubmitting.set(false),
    });
  }

  deletePax(paxId: number): void {
    this.tourPaxService.deleteTourPax(this.tourId, paxId).subscribe({
      next: () => {
        this.paxConfigs.update((paxes) => paxes.filter((p) => p.id !== paxId));
        this.message.success('Xóa thành công!');
      },
      error: (err) => {
        console.error(err);
        this.message.error('Xóa thất bại');
      },
    });
  }

  applyAndSaveAllPrices(): void {
    if (this.priceToolForm.invalid) return;
    this.isSubmitting.set(true);
    const { profitRate, extraCost } = this.priceToolForm.value;

    this.tourPaxService
      .calculateAndSavePrices(this.tourId, { profitRate, extraCost })
      .subscribe({
        next: (res) => {
          this.paxConfigs.set(res);
          this.message.success('Đã cập nhật giá cho toàn bộ tour!');
        },
        error: (err) => {
          console.error(err);
          this.message.error('Cập nhật giá thất bại');
        },
        complete: () => this.isSubmitting.set(false),
      });
  }

  // --- Validators ---
  private minMaxValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const min = group.get('minQuantity')?.value;
      const max = group.get('maxQuantity')?.value;
      return min !== null && max !== null && min > max
        ? { minMax: true }
        : null;
    };
  }

  private overlapValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const min = group.get('minQuantity')?.value;
      const max = group.get('maxQuantity')?.value;
      if (min === null || max === null) return null;

      const isOverlapping = this.paxConfigs()
        .filter((p) => p.id !== this.currentPaxId())
        .some(
          (pax) =>
            (min >= pax.minQuantity && min <= pax.maxQuantity) ||
            (max >= pax.minQuantity && max <= pax.maxQuantity) ||
            (min < pax.minQuantity && max > pax.maxQuantity)
        );

      return isOverlapping ? { overlap: true } : null;
    };
  }

  private priceValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const isManual = formGroup.get('manualPrice')?.value;
      const fixedPrice = formGroup.get('fixedPrice')?.value;
      const sellingPrice = formGroup.get('sellingPrice')?.value;

      if (isManual) {
        if (fixedPrice === null || sellingPrice === null)
          return { required: true };
        if (fixedPrice > sellingPrice) return { priceInvalid: true };
      }
      return null;
    };
  }
}
