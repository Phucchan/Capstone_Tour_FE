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
import { NgSelectModule } from '@ng-select/ng-select';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { TourService } from '../../../../core/services/tour.service';
import { PartnerServiceService } from '../../../../core/services/partner-service.service';
import {
  TourOption,
  PartnerServiceShortDTO,
  TourDayManagerCreateRequestDTO,
  TourDayManagerDTO,
  ServiceTypeShortDTO,
  ServiceInfoDTO,
} from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-day-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, FormsModule],
  templateUrl: './tour-day-form.component.html',
})
export class TourDayFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private partnerService = inject(PartnerServiceService);

  @Input() isVisible = false;
  @Input() dayData: TourDayManagerDTO | null = null;
  @Input() tourId!: number;
  @Output() formSaved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  public dayForm!: FormGroup;
  public formTitle = 'Thêm ngày mới';
  public locations$!: Observable<TourOption[]>;
  public isLoading = false;

  // --- State cho việc chọn dịch vụ ---
  public serviceTypes: ServiceTypeShortDTO[] = [];
  public filteredPartnerServices: PartnerServiceShortDTO[] = [];

  public selectedServiceType: ServiceTypeShortDTO | null = null;
  public selectedPartnerService: number | null = null;
  public selectedServicesList: ServiceInfoDTO[] = [];

  constructor() {
    this.dayForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      locationId: [null],
    });
  }

  ngOnInit(): void {
    this.locations$ = this.tourService
      .getTourOptions()
      .pipe(map((options) => options.destinations));

    // Chỉ tải danh sách loại dịch vụ khi component khởi tạo
    this.tourService
      .getServiceTypes()
      .subscribe((types) => (this.serviceTypes = types));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dayData'] && this.dayData) {
      this.formTitle = `Sửa thông tin: Ngày ${this.dayData.dayNumber}`;
      this.dayForm.patchValue({
        title: this.dayData.title,
        description: this.dayData.description,
        locationId: this.dayData.location ? this.dayData.location.id : null,
      });
      this.selectedServicesList = [...(this.dayData.services || [])];
    } else {
      this.formTitle = 'Thêm ngày mới';
      this.dayForm.reset();
      this.selectedServicesList = [];
    }
    // Reset lựa chọn dịch vụ mỗi khi form mở/thay đổi
    this.selectedServiceType = null;
    this.filteredPartnerServices = [];
    this.selectedPartnerService = null;
  }

  /**
   * SỬA LỖI RACE CONDITION:
   * Chỉ gọi API để lấy dịch vụ cụ thể SAU KHI người dùng đã chọn một loại.
   */
  onServiceTypeChange(serviceType: ServiceTypeShortDTO | null): void {
    this.selectedPartnerService = null;
    this.filteredPartnerServices = [];
    this.selectedServiceType = serviceType;

    if (serviceType) {
      this.isLoading = true;
      // Gửi ID của loại dịch vụ đi
      this.partnerService
        .getPartnerServicesByType(serviceType.id)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe((services) => {
          this.filteredPartnerServices = services;
        });
    }
  }
  addSelectedService(): void {
    if (!this.selectedPartnerService || !this.dayData) return;

    const serviceId = this.selectedPartnerService;
    if (this.selectedServicesList.some((s) => s.id === serviceId)) {
      alert('Dịch vụ này đã được thêm.');
      return;
    }

    this.isLoading = true;
    this.tourService
      .addServiceToTourDay(this.tourId, this.dayData.id, serviceId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updatedDay: TourDayManagerDTO) => {
          this.selectedServicesList = [...(updatedDay.services || [])];
          this.selectedPartnerService = null; // Reset ô chọn dịch vụ cụ thể
        },
        error: (err) => alert('Lỗi khi thêm dịch vụ: ' + err.error?.message),
      });
  }

  removeService(serviceId: number): void {
    if (!this.dayData) return;

    this.isLoading = true;
    this.tourService
      .removeServiceFromTourDay(this.tourId, this.dayData.id, serviceId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updatedDay: TourDayManagerDTO) => {
          this.selectedServicesList = [...(updatedDay.services || [])];
        },
        error: (err) => alert('Lỗi khi xóa dịch vụ: ' + err.error?.message),
      });
  }

  onSave(): void {
    if (this.dayForm.invalid) return;

    this.isLoading = true;
    let saveObservable: Observable<any>;
    const payload: TourDayManagerCreateRequestDTO = {
      ...this.dayForm.value,
      serviceTypeIds: [], // Trường này có vẻ không còn cần thiết
    };

    if (this.dayData) {
      saveObservable = this.tourService.updateTourDay(
        this.tourId,
        this.dayData.id,
        payload
      );
    } else {
      saveObservable = this.tourService.addTourDay(this.tourId, payload);
    }

    saveObservable.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: () => {
        alert(
          this.dayData ? 'Cập nhật thành công!' : 'Thêm ngày mới thành công!'
        );
        this.formSaved.emit();
      },
      error: (err) => alert('Lỗi khi lưu: ' + err.error?.message),
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
