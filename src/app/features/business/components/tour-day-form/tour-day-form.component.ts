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
// FIX: Import FormsModule for ngModel
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
import {
  TourOption,
  PartnerServiceShortDTO,
  TourDayManagerCreateRequestDTO,
  TourDayManagerDTO,
  ServiceTypeShortDTO,
  ServiceInfoDTO,
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

@Component({
  selector: 'app-tour-day-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // FIX: Add FormsModule
    // --- NG-ZORRO ---
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSpinModule,
    NzDividerModule,
    NzListModule,
    NzIconModule,
  ],
  templateUrl: './tour-day-form.component.html',
})
export class TourDayFormComponent implements OnInit, OnChanges {
  // --- Injections ---
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private partnerService = inject(PartnerServiceService);
  private message = inject(NzMessageService);

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
    this.tourService
      .getServiceTypes()
      .subscribe((types) => (this.serviceTypes = types));
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

  // FIX: Changed parameter type from Event to number
  onServiceTypeChange(typeId: number | null): void {
    this.selectedPartnerService = null;
    this.filteredPartnerServices = [];
    if (typeId) {
      this.isServiceLoading = true;
      this.partnerService
        .getPartnerServicesByType(typeId)
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
    const payload: TourDayManagerCreateRequestDTO = {
      ...this.dayForm.value,
      serviceTypeIds: [], // This field seems no longer needed
    };

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
}
