import { Component, OnInit } from '@angular/core';
// [SỬA LỖI] Xóa import NumberPipe không hợp lệ. CommonModule đã bao gồm các pipe cơ bản.
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

// --- Imports từ project của bạn ---
import { ServiceApprovalService } from '../../services/service-approval.service';
import { ServiceInfo } from '../../models/service-approval.model';
import { Paging } from '../../../../core/models/paging.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-service-approval',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // [SỬA LỖI] Xóa NumberPipe khỏi mảng imports.
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
  ],
  // [SỬA LỖI] Xóa providers: [NumberPipe] không cần thiết.
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

  constructor(
    private serviceApprovalService: ServiceApprovalService,
    private message: NzMessageService
  ) {
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
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

  approveService(serviceId: number): void {
    this.updateStatus(serviceId, 'ACTIVE');
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
}
