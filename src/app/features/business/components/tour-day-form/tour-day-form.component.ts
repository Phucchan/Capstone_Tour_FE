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
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- Thêm map vào đây

import { TourService } from '../../../../core/services/tour.service';
import {
  TourOption, // <-- SỬA LẠI: Dùng TourOption thay vì LocationShort
  ServiceTypeShortDTO,
  TourDayManagerCreateRequestDTO,
  TourDayManagerDTO,
} from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-day-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './tour-day-form.component.html',
})
export class TourDayFormComponent implements OnInit, OnChanges {
  // --- Injections ---
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);

  // --- Inputs & Outputs ---
  @Input() isVisible = false;
  @Input() dayData: TourDayManagerDTO | null = null; // Dữ liệu để sửa
  @Output() save = new EventEmitter<TourDayManagerCreateRequestDTO>();
  @Output() close = new EventEmitter<void>();

  // --- Properties ---
  public dayForm!: FormGroup;
  public formTitle = 'Thêm ngày mới';
  public locations$!: Observable<TourOption[]>; // <-- SỬA LẠI: Dùng TourOption[]
  public serviceTypes$!: Observable<ServiceTypeShortDTO[]>;

  constructor() {
    this.dayForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      locationId: [null],
      serviceTypeIds: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    // Lấy dữ liệu cho các dropdown
    // SỬA LẠI: Sửa cú pháp của .pipe()
    this.locations$ = this.tourService
      .getTourOptions()
      .pipe(map((options) => options.destinations));
    this.serviceTypes$ = this.tourService.getServiceTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Khi component nhận được dữ liệu mới (khi bấm nút Sửa)
    if (changes['dayData'] && this.dayData) {
      this.formTitle = `Sửa thông tin: Ngày ${this.dayData.dayNumber}`;

      // Điền dữ liệu cũ vào form
      this.dayForm.patchValue({
        title: this.dayData.title,
        description: this.dayData.description,
        // --- SỬA LẠI ĐỂ NHẬN LOCATION ID ---
        locationId: this.dayData.location ? this.dayData.location.id : null,
        serviceTypeIds: this.dayData.serviceTypes.map((s) => s.id),
      });
    } else {
      // Nếu không có dữ liệu (khi bấm Thêm mới)
      this.formTitle = 'Thêm ngày mới';
      this.dayForm.reset({
        serviceTypeIds: [], // Đảm bảo mảng rỗng khi reset
      });
    }
  }

  // --- Event Handlers ---
  onSave(): void {
    if (this.dayForm.invalid) {
      this.dayForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.dayForm.value);
  }

  onClose(): void {
    this.close.emit();
  }
}
