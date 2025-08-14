import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceApprovalService } from '../../services/service-approval.service';
import { ServiceInfo } from '../../models/service-approval.model';
import { Paging } from '../../../../core/models/paging.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-service-approval',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    PaginationComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './service-approval.component.html',
})
export class ServiceApprovalComponent implements OnInit {
  isLoading = true;
  services: ServiceInfo[] = [];
  errorMessage: string | null = null;

  // Phân trang
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  // Tìm kiếm
  filterForm: FormGroup;

  constructor(private serviceApprovalService: ServiceApprovalService) {
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
    });
  }

  ngOnInit(): void {
    // Tải dữ liệu lần đầu
    this.loadPendingServices().subscribe();

    // Lắng nghe thay đổi trên ô tìm kiếm
    this.filterForm
      .get('keyword')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        // === SỬA LỖI 1: switchMap giờ sẽ nhận một Observable từ loadPendingServices ===
        switchMap(() => this.loadPendingServices(0))
      )
      .subscribe();
  }

  /**
   * === SỬA LỖI 1: Hàm này giờ sẽ trả về một Observable ===
   * Điều này cho phép nó được sử dụng bên trong các toán tử RxJS như switchMap.
   */
  loadPendingServices(
    page: number = this.currentPage
  ): Observable<ApiResponse<Paging<ServiceInfo>>> {
    this.isLoading = true;
    this.currentPage = page;
    const keyword = this.filterForm.get('keyword')?.value;

    return this.serviceApprovalService
      .getPendingServices(this.currentPage, this.pageSize, keyword)
      .pipe(
        tap({
          next: (response) => {
            // === SỬA LỖI 2: Kiểm tra response.data thay vì response.success ===
            if (response && response.data) {
              const pageData = response.data; // Dữ liệu đã được bóc tách sẵn
              this.services = pageData.items;
              this.totalItems = pageData.total;
              this.currentPage = pageData.page;
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

  onPageChange(page: number): void {
    this.loadPendingServices(page).subscribe();
  }

  approveService(serviceId: number): void {
    this.updateStatus(serviceId, 'ACTIVE');
  }

  rejectService(serviceId: number): void {
    this.updateStatus(serviceId, 'REJECTED');
  }

  private updateStatus(
    serviceId: number,
    newStatus: 'ACTIVE' | 'REJECTED'
  ): void {
    if (
      !confirm(
        `Bạn có chắc muốn ${
          newStatus === 'ACTIVE' ? 'phê duyệt' : 'từ chối'
        } dịch vụ này không?`
      )
    ) {
      return;
    }

    this.serviceApprovalService
      .updateServiceStatus(serviceId, { newStatus })
      .subscribe({
        next: (response) => {
          // === SỬA LỖI 2: Kiểm tra response.data thay vì response.success ===
          if (response && response.data) {
            alert('Cập nhật trạng thái thành công!');
            // Tải lại danh sách để loại bỏ dịch vụ vừa được xử lý
            this.loadPendingServices(this.currentPage).subscribe();
          } else {
            alert(`Lỗi: ${response.message}`);
          }
        },
        error: (err) => {
          alert(`Đã có lỗi xảy ra: ${err.message}`);
        },
      });
  }
}
