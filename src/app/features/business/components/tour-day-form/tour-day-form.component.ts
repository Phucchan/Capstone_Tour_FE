import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

// Core Services & Models
import { TourService } from '../../../../core/services/tour.service';
import { PartnerServiceService } from '../../../../core/services/partner-service.service';

// ---  Import service và model thật từ module coordinator ---
import { PartnerService } from '../../../coordinator/services/partner.service';
import { PartnerSummary } from '../../../coordinator/models/partner.model';

// Các model này đã được xác nhận là nằm trong tour.model.ts
import {
  TourOption,
  PartnerServiceShortDTO,
  TourDayManagerCreateRequestDTO,
  TourDayManagerDTO,
  ServiceTypeShortDTO,
  ServiceInfoDTO,
  PartnerServiceCreateDTO,
} from '../../../../core/models/tour.model';

// NG-ZORRO Imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-tour-day-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // --- NG-ZORRO ---
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSpinModule,
    NzDividerModule,
    NzListModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzToolTipModule,
  ],
  templateUrl: './tour-day-form.component.html',
})
export class TourDayFormComponent implements OnInit, OnChanges {
  // --- Injections ---
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private partnerFilterService = inject(PartnerServiceService);
  private message = inject(NzMessageService);
  private partnerService = inject(PartnerService);

  // --- Inputs & Outputs ---
  @Input() dayData: TourDayManagerDTO | null = null;
  @Input() tourId!: number;
  @Output() formSaved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // --- State ---
  dayForm!: FormGroup;
  locations$!: Observable<TourOption[]>;
  isLoading = false;
  isServiceLoading = false;

  // --- Service Selection State ---
  serviceTypes: ServiceTypeShortDTO[] = [];
  filteredPartnerServices: PartnerServiceShortDTO[] = [];
  selectedServiceType: number | null = null;
  selectedPartnerService: number | null = null;
  selectedServicesList: ServiceInfoDTO[] = [];

  // --- New Service Modal State ---
  isCreateServiceModalVisible = false;
  isCreatingService = false;
  newServiceForm!: FormGroup;
  partners$!: Observable<PartnerSummary[]>;

  constructor() {
    this.dayForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      locationId: [null, Validators.required],
    });

    this.newServiceForm = this.fb.group({
      name: ['', Validators.required],
      partnerId: [null, Validators.required],
      serviceTypeId: [null, Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.locations$ = this.tourService
      .getTourOptions()
      .pipe(map((options) => options.destinations));
    this.tourService
      .getServiceTypes()
      .subscribe((types) => (this.serviceTypes = types));

    // Lấy tất cả đối tác đang hoạt động để hiển thị trong dropdown
    this.partners$ = this.partnerService
      .getPartners(0, 1000, '', false)
      .pipe(map((response) => response.data.items));
    this.resetFormAndServices();

    this.dayForm.get('locationId')?.valueChanges.subscribe(() => {
      this.selectedServiceType = null;
      this.selectedPartnerService = null;
      this.filteredPartnerServices = [];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dayData']) {
      this.resetFormAndServices();
    }
  }

  private resetFormAndServices(): void {
    if (this.dayData) {
      this.dayForm.patchValue({
        title: this.dayData.title,
        description: this.dayData.description,
        locationId: this.dayData.location?.id,
      });
      this.selectedServicesList = [...(this.dayData.services || [])];
    } else {
      this.dayForm.reset();
      this.selectedServicesList = [];
    }
    this.selectedServiceType = null;
    this.filteredPartnerServices = [];
    this.selectedPartnerService = null;
  }

  onServiceTypeChange(typeId: number | null): void {
    this.selectedPartnerService = null; // Reset lựa chọn dịch vụ chi tiết
    this.filteredPartnerServices = []; // Xóa danh sách dịch vụ cũ
    const locationId = this.dayForm.get('locationId')?.value;

    // Chỉ gọi API khi cả loại dịch vụ và địa điểm đã được chọn
    if (typeId && locationId) {
      this.isServiceLoading = true;
      this.tourService
        .getPartnerServices(typeId, locationId) // Gọi service với cả 2 tham số
        .pipe(finalize(() => (this.isServiceLoading = false)))
        .subscribe((services) => (this.filteredPartnerServices = services));
    }
  }

  addSelectedService(): void {
    if (!this.selectedPartnerService || !this.dayData) return;

    const serviceId = this.selectedPartnerService;
    if (this.selectedServicesList.some((s) => s.id === serviceId)) {
      this.message.warning('Dịch vụ này đã được thêm.');
      return;
    }

    this.isLoading = true;
    this.tourService
      .addServiceToTourDay(this.tourId, this.dayData.id, serviceId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updatedDay) => {
          this.selectedServicesList = [...(updatedDay.services || [])];
          this.selectedPartnerService = null;
          this.message.success('Thêm dịch vụ thành công.');
        },
        error: (err) =>
          this.message.error(err.error?.message || 'Lỗi khi thêm dịch vụ'),
      });
  }

  removeService(serviceId: number): void {
    if (!this.dayData) return;

    this.isLoading = true;
    this.tourService
      .removeServiceFromTourDay(this.tourId, this.dayData.id, serviceId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updatedDay) => {
          this.selectedServicesList = [...(updatedDay.services || [])];
          this.message.success('Xóa dịch vụ thành công.');
        },
        error: (err) =>
          this.message.error(err.error?.message || 'Lỗi khi xóa dịch vụ'),
      });
  }

  onSave(): void {
    if (this.dayForm.invalid) {
      Object.values(this.dayForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true;
    const payload: TourDayManagerCreateRequestDTO = this.dayForm.value;

    const saveObservable = this.dayData
      ? this.tourService.updateTourDay(this.tourId, this.dayData.id, payload)
      : this.tourService.addTourDay(this.tourId, payload);

    saveObservable.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => this.formSaved.emit(),
      error: (err) => this.message.error(err.error?.message || 'Lỗi khi lưu'),
    });
  }

  onClose(): void {
    this.close.emit();
  }

  openCreateServiceModal(): void {
    this.newServiceForm.reset();
    this.isCreateServiceModalVisible = true;
  }

  handleCreateServiceCancel(): void {
    this.isCreateServiceModalVisible = false;
  }

  handleCreateServiceOk(): void {
    if (this.newServiceForm.invalid) {
      Object.values(this.newServiceForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    if (!this.dayData) return;

    this.isCreatingService = true;
    const payload: PartnerServiceCreateDTO = this.newServiceForm.value;

    this.tourService
      .createServiceForTourDay(this.tourId, this.dayData.id, payload)
      .pipe(finalize(() => (this.isCreatingService = false)))
      .subscribe({
        next: (newService: ServiceInfoDTO) => {
          this.selectedServicesList = [
            ...this.selectedServicesList,
            newService,
          ];
          this.message.success(`Đã tạo và thêm dịch vụ "${newService.name}"`);
          this.isCreateServiceModalVisible = false;
        },
        error: (err: any) =>
          this.message.error(err.error?.message || 'Lỗi khi tạo dịch vụ mới'),
      });
  }
}
