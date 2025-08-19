import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// --- [THÊM MỚI] Imports cho các module của NG-ZORRO ---
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

// --- Imports từ project của bạn ---
import { ServiceTypeService } from '../../services/service-type.service';
import { ServiceType } from '../../models/service-type.model';

@Component({
  selector: 'app-service-type-management',
  standalone: true,
  // --- [CẬP NHẬT] Thêm các module của NG-ZORRO ---
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzPopconfirmModule,
    NzSpaceModule,
    NzTagModule,
    NzToolTipModule,
  ],
  templateUrl: './service-type-management.component.html',
})
export class ServiceTypeManagementComponent implements OnInit {
  serviceTypes: ServiceType[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Thuộc tính cho modal
  isModalVisible = false;
  isEditMode = false;
  isSubmitting = false;
  currentServiceTypeId: number | null = null;
  serviceTypeForm: FormGroup;

  constructor(
    private serviceTypeService: ServiceTypeService,
    private fb: FormBuilder,
    private message: NzMessageService
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
            this.message.error(res.message || 'Tải dữ liệu thất bại!');
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Lỗi tải dữ liệu';
          // [SỬA LỖI] Kiểm tra this.errorMessage trước khi truyền vào message.error
          if (this.errorMessage) {
            this.message.error(this.errorMessage);
          }
        },
      });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.serviceTypeForm.reset();
    this.currentServiceTypeId = null;
    this.isModalVisible = true;
  }

  openEditModal(serviceType: ServiceType): void {
    this.isEditMode = true;
    this.serviceTypeForm.setValue({
      code: serviceType.code,
      name: serviceType.name,
    });
    this.currentServiceTypeId = serviceType.id;
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  onSubmit(): void {
    if (this.serviceTypeForm.invalid) {
      // Đánh dấu tất cả các trường là dirty để hiển thị lỗi
      for (const i in this.serviceTypeForm.controls) {
        this.serviceTypeForm.controls[i].markAsDirty();
        this.serviceTypeForm.controls[i].updateValueAndValidity();
      }
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
        this.message.success(
          this.isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!'
        );
        this.loadServiceTypes();
        this.isModalVisible = false;
      },
      error: (err) => {
        this.message.error(
          err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
        );
      },
    });
  }

  toggleStatus(serviceType: ServiceType): void {
    const newStatus = !serviceType.deleted;
    const actionText = newStatus ? 'Vô hiệu hóa' : 'Kích hoạt';

    this.serviceTypeService
      .changeStatus(serviceType.id, { deleted: newStatus })
      .subscribe({
        next: () => {
          this.message.success(
            `${actionText} loại dịch vụ "${serviceType.name}" thành công!`
          );
          this.loadServiceTypes();
        },
        error: (err) =>
          this.message.error(err.error?.message || 'Cập nhật thất bại!'),
      });
  }
}
