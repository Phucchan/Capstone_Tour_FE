import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Observable } from 'rxjs';

// --- Imports cho các module của NG-ZORRO ---
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

// --- Imports từ project của bạn ---
import { ServiceApprovalService } from '../../services/service-approval.service';
import {
  ServiceInfo,
  PendingServiceUpdateRequest,
} from '../../models/service-approval.model';
import { Paging } from '../../../../core/models/paging.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-service-approval',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzFormModule,
    NzInputModule,
    NzPopconfirmModule,
    NzBreadCrumbModule,
    NzEmptyModule,
    NzGridModule,
    NzModalModule,
    NzInputNumberModule,
  ],
  templateUrl: './service-approval.component.html',
})
export class ServiceApprovalComponent implements OnInit {
  isLoading = true;
  services: ServiceInfo[] = [];
  errorMessage: string | null = null;

  // Phân trang
  currentPage = 1; // Zorro table is 1-based
  pageSize = 10;
  totalItems = 0;

  // Tìm kiếm
  filterForm: FormGroup;

  // Logic cho Modal
  isModalVisible = false;
  isSubmitting = false;
  selectedService: ServiceInfo | null = null;
  approvalForm: FormGroup;

  constructor(
    private serviceApprovalService: ServiceApprovalService,
    private message: NzMessageService,
    private fb: FormBuilder // Inject FormBuilder
  ) {
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });

    // Khởi tạo form cho modal
    this.approvalForm = this.fb.group({
      nettPrice: [null, [Validators.required, Validators.min(0)]],
      sellingPrice: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    // Tải dữ liệu lần đầu
    this.loadPendingServices().subscribe();

    // Lắng nghe thay đổi trên ô tìm kiếm
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.loadPendingServices(true)), // Reset về trang 1 khi lọc
        switchMap(() => this.loadPendingServices())
      )
      .subscribe();
  }

  /**
   * Tải danh sách dịch vụ đang chờ xử lý.
   * @param resetPageIndex Cờ để reset về trang đầu tiên.
   */
  loadPendingServices(
    resetPageIndex: boolean = false
  ): Observable<ApiResponse<Paging<ServiceInfo>>> {
    if (resetPageIndex) {
      this.currentPage = 1;
    }
    this.isLoading = true;
    const keyword = this.filterForm.get('keyword')?.value;
    const apiPageIndex = this.currentPage - 1; // Chuyển về 0-based cho API

    return this.serviceApprovalService
      .getPendingServices(apiPageIndex, this.pageSize, keyword)
      .pipe(
        tap({
          next: (response) => {
            if (response && response.data) {
              const pageData = response.data;
              this.services = pageData.items;
              this.totalItems = pageData.total;
              this.errorMessage = null;
            } else {
              this.errorMessage = response.message || 'Không thể tải dữ liệu.';
              this.services = [];
              this.totalItems = 0;
            }
          },
          error: (err) => {
            this.errorMessage =
              err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            this.services = [];
            this.totalItems = 0;
          },
        }),
        finalize(() => (this.isLoading = false))
      );
  }
  // Mở modal và điền dữ liệu của dịch vụ được chọn vào form
  openApprovalModal(service: ServiceInfo): void {
    this.selectedService = service;
    this.approvalForm.patchValue({
      nettPrice: service.nettPrice,
      sellingPrice: service.sellingPrice,
    });
    this.isModalVisible = true;
  }

  // Xử lý khi nhấn nút "Duyệt và Lưu" trên modal
  handleModalOk(): void {
    if (this.approvalForm.valid && this.selectedService) {
      this.isSubmitting = true;
      const formValues = this.approvalForm.value;

      const request: PendingServiceUpdateRequest = {
        newStatus: 'ACTIVE',
        nettPrice: formValues.nettPrice,
        sellingPrice: formValues.sellingPrice,
      };

      this.serviceApprovalService
        .updateServiceStatus(this.selectedService.id, request)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response && response.data) {
              this.message.success(`Phê duyệt dịch vụ thành công!`);
              this.isModalVisible = false;
              this.loadPendingServices().subscribe();
            } else {
              this.message.error(
                response.message || `Lỗi khi phê duyệt dịch vụ.`
              );
            }
          },
          error: (err) => {
            this.message.error(err.message || `Đã có lỗi xảy ra.`);
          },
        });
    } else {
      Object.values(this.approvalForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // Xử lý khi đóng modal
  handleModalCancel(): void {
    this.isModalVisible = false;
    this.selectedService = null;
  }

  rejectService(serviceId: number): void {
    this.updateStatus(serviceId, 'REJECTED');
  }

  /**
   * Cập nhật trạng thái dịch vụ (Duyệt/Từ chối).
   */
  private updateStatus(
    serviceId: number,
    newStatus: 'ACTIVE' | 'REJECTED'
  ): void {
    const actionText = newStatus === 'ACTIVE' ? 'Phê duyệt' : 'Từ chối';

    this.serviceApprovalService
      .updateServiceStatus(serviceId, { newStatus })
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.message.success(`${actionText} dịch vụ thành công!`);
            // Tải lại danh sách để cập nhật giao diện
            this.loadPendingServices().subscribe();
          } else {
            this.message.error(
              response.message || `Lỗi khi ${actionText.toLowerCase()} dịch vụ.`
            );
          }
        },
        error: (err) => {
          this.message.error(err.message || `Đã có lỗi xảy ra.`);
        },
      });
  }

  // Hàm định dạng và phân tích giá trị tiền tệ cho nz-input-number
  formatterVND = (value: number): string =>
    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  parserVND = (value: string): number =>
    parseFloat(value.replace(/₫\s?|(,*)/g, ''));
}
