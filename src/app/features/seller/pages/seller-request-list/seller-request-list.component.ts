import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, debounceTime } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';

import { SellerBookingService } from '../../services/seller-booking.service';
import { RequestBookingSummary } from '../../models/request-booking-summary.model';
import { Paging } from '../../../../core/models/paging.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { StatusVietnamesePipe } from '../../../../shared/pipes/status-vietnamese.pipe';

@Component({
  selector: 'app-seller-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormatDatePipe,
    StatusVietnamesePipe,
    NzTableModule,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzPopconfirmModule,
    NzModalModule,
    NzInputModule,
    NzTagModule,
    NzFormModule,
    NzSelectModule,
    NzGridModule,
    NzCardModule,
  ],
  templateUrl: './seller-request-list.component.html',
})
export class SellerRequestListComponent implements OnInit {
  private sellerService = inject(SellerBookingService);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);
  private fb = inject(FormBuilder);

  filterForm!: FormGroup;
  requestStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];

  requests: RequestBookingSummary[] = [];
  isLoading = true;
  paging: Paging<any> = { page: 0, size: 10, total: 0, items: [] };

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      keyword: [null],
      status: [null],
    });

    this.loadRequests();

    this.filterForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.paging.page = 0; // Reset to first page on filter change
      this.loadRequests();
    });
  }

  loadRequests(): void {
    this.isLoading = true;
    const { keyword, status } = this.filterForm.value;
    this.sellerService
      .getRequestBookings(this.paging.page, this.paging.size, keyword, status)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.requests = res.data.items || [];
            this.paging = { ...res.data, items: [] };
          } else {
            this.message.error(
              res.message || 'Không thể tải danh sách yêu cầu.'
            );
          }
        },
        error: () => this.message.error('Đã xảy ra lỗi. Vui lòng thử lại.'),
      });
  }

  onApprove(requestId: number): void {
    this.sellerService.approveRequestBooking(requestId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.message.success('Duyệt yêu cầu thành công!');
          this.loadRequests();
        } else {
          this.message.error(res.message || 'Duyệt yêu cầu thất bại.');
        }
      },
      error: (err) =>
        this.message.error(err.error?.message || 'Đã xảy ra lỗi.'),
    });
  }

  showRejectModal(requestId: number): void {
    let reason = '';
    this.modal.create({
      nzTitle: 'Xác nhận từ chối yêu cầu',
      nzContent: `
        <div>
          <p>Vui lòng nhập lý do từ chối yêu cầu này. Lý do sẽ được gửi cho khách hàng.</p>
          <textarea nz-input [(ngModel)]="reason" placeholder="VD: Không đủ nguồn lực để đáp ứng..." [nzAutosize]="{ minRows: 3, maxRows: 5 }"></textarea>
        </div>
      `,
      nzOkText: 'Xác nhận từ chối',
      nzOkDanger: true,
      nzOnOk: () => {
        if (!reason || reason.trim() === '') {
          this.message.error('Lý do từ chối không được để trống.');
          return false;
        }
        this.onReject(requestId, reason);
        return true;
      },
      nzCancelText: 'Hủy',
    });
  }

  private onReject(requestId: number, reason: string): void {
    this.sellerService.rejectRequestBooking(requestId, reason).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.message.success('Đã từ chối yêu cầu thành công!');
          this.loadRequests();
        } else {
          this.message.error(res.message || 'Từ chối yêu cầu thất bại.');
        }
      },
      error: (err) =>
        this.message.error(err.error?.message || 'Đã xảy ra lỗi.'),
    });
  }

  onPageIndexChange(page: number): void {
    this.paging.page = page - 1;
    this.loadRequests();
  }
}
