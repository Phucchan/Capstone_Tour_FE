import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { ServiceTypeService } from '../services/service-type.service';
import { ServiceType } from '../models/service-type.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-service-type-management',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ReactiveFormsModule],
  templateUrl: './service-type-management.component.html',
})
export class ServiceTypeManagementComponent implements OnInit {
  serviceTypes: ServiceType[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Thuộc tính cho modal form
  showModal = false;
  isEditMode = false;
  isSubmitting = false;
  currentServiceTypeId: number | null = null;
  serviceTypeForm: FormGroup;

  constructor(
    private serviceTypeService: ServiceTypeService,
    private fb: FormBuilder
  ) {
    this.serviceTypeForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadServiceTypes();
  }

  loadServiceTypes(): void {
    this.isLoading = true;
    this.serviceTypeService
      .getServiceTypes()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.status === 200 && res.data) {
            this.serviceTypes = res.data;
          } else {
            this.errorMessage = res.message;
          }
        },
        error: (err) =>
          (this.errorMessage = err.error?.message || 'Lỗi tải dữ liệu'),
      });
  }

  // Mở modal để thêm mới
  openAddModal(): void {
    this.isEditMode = false;
    this.serviceTypeForm.reset();
    this.currentServiceTypeId = null;
    this.showModal = true;
  }

  // Mở modal để chỉnh sửa
  openEditModal(serviceType: ServiceType): void {
    this.isEditMode = true;
    this.serviceTypeForm.setValue({
      code: serviceType.code,
      name: serviceType.name,
    });
    this.currentServiceTypeId = serviceType.id;
    this.showModal = true;
  }

  // Đóng modal
  closeModal(): void {
    this.showModal = false;
  }

  // Xử lý submit form
  onSubmit(): void {
    if (this.serviceTypeForm.invalid) {
      return;
    }
    this.isSubmitting = true;

    const formData = this.serviceTypeForm.value;
    const action$ = this.isEditMode
      ? this.serviceTypeService.updateServiceType(
          this.currentServiceTypeId!,
          formData
        )
      : this.serviceTypeService.createServiceType(formData);

    action$.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        alert(this.isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        this.loadServiceTypes();
        this.closeModal();
      },
      error: (err) => {
        alert(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      },
    });
  }

  // Thay đổi trạng thái

  toggleStatus(serviceType: ServiceType): void {
    const newStatus = !serviceType.deleted;
    const confirmation = confirm(
      `Bạn có chắc muốn ${
        newStatus ? 'vô hiệu hóa' : 'kích hoạt'
      } loại dịch vụ "${serviceType.name}" không?`
    );

    if (confirmation) {
      this.serviceTypeService
        .changeStatus(serviceType.id, { deleted: newStatus })
        .subscribe({
          next: () => this.loadServiceTypes(),
          error: (err) => alert(`Cập nhật thất bại: ${err.error?.message}`),
        });
    }
  }
}
