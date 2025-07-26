// src/app/features/business/components/location-form/location-form.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LocationService } from '../../services/location.service';
import {
  LocationDTO,
  LocationRequestDTO,
  GeneralResponse,
} from '../../../../core/models/location.model';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-form.component.html',
})
export class LocationFormComponent implements OnInit {
  @Input() locationToEdit: LocationDTO | null = null;
  @Output() formSaved = new EventEmitter<boolean>();

  locationForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService
  ) {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      image: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Nếu có dữ liệu truyền vào (chế độ sửa), điền vào form
    if (this.locationToEdit) {
      this.locationForm.patchValue(this.locationToEdit);
    }
  }

  /**
   * Xử lý khi người dùng nhấn nút "Lưu".
   */
  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData: LocationRequestDTO = this.locationForm.value;

    let saveObservable: Observable<GeneralResponse<LocationDTO>>;

    // Kiểm tra xem đang ở chế độ sửa hay thêm mới
    if (this.locationToEdit) {
      // Chế độ SỬA: gọi API update
      saveObservable = this.locationService.updateLocation(
        this.locationToEdit.id,
        formData
      );
    } else {
      // Chế độ THÊM MỚI: gọi API create
      saveObservable = this.locationService.createLocation(formData);
    }

    // Subscribe vào observable đã được chọn
    saveObservable.subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          console.log(
            `Location ${
              this.locationToEdit ? 'updated' : 'created'
            } successfully!`
          );
          this.formSaved.emit(true); // Gửi sự kiện thành công
        } else {
          console.error(`Failed to save location:`, response.message);
          this.formSaved.emit(false); // Gửi sự kiện thất bại
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('API error:', err);
        this.isSubmitting = false;
        this.formSaved.emit(false); // Gửi sự kiện thất bại
      },
    });
  }

  get f() {
    return this.locationForm.controls;
  }
}
