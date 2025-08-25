import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalService, NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AccountantService } from '../../services/accountant.service';
import { BookingRefundDetail } from '../../models/booking-refund-detail.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { RefundBillViewComponent } from '../../components/refund-bill-view/refund-bill-view.component';
import { CreateRefundBillModalComponent } from '../../components/create-refund-bill-modal/create-refund-bill-modal.component';
import { StatusVietnamesePipe } from '../../../../shared/pipes/status-vietnamese.pipe';

@Component({
  selector: 'app-refund-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzDescriptionsModule,
    NzCardModule,
    NzButtonModule,
    NzTagModule,
    NzModalModule,
    NzSpinModule,
    NzIconModule,
    FormatDatePipe,
    CurrencyVndPipe,
    StatusVietnamesePipe,
    RefundBillViewComponent,
  ],
  templateUrl: './refund-request-detail.component.html',
})
export class RefundRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountantService = inject(AccountantService);
  private modalService = inject(NzModalService);
  private messageService = inject(NzMessageService);

  detail: BookingRefundDetail | null = null;
  isLoading = true;
  isProcessing = false;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isLoading = true;
            return this.accountantService.getRefundRequestDetail(+id);
          }
          this.router.navigate(['/accountant/refunds']);
          return EMPTY;
        })
      )
      .subscribe({
        next: (data) => {
          this.detail = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.messageService.error('Không thể tải chi tiết yêu cầu.');
          this.router.navigate(['/accountant/refunds']);
        },
      });
  }

  approveCancellation(): void {
    if (!this.detail || this.isProcessing) return;

    this.modalService.confirm({
      nzTitle: 'Xác nhận duyệt yêu cầu hủy?',
      nzContent:
        'Hành động này sẽ chuyển trạng thái booking sang "Đã Hủy" để chuẩn bị hoàn tiền.',
      nzOkText: 'Xác nhận',
      nzCancelText: 'Hủy bỏ',
      nzOnOk: () => {
        this.isProcessing = true;
        this.accountantService
          .approveCancellation(this.detail!.bookingId)
          .subscribe({
            next: (updatedDetail) => {
              this.detail = updatedDetail;
              this.messageService.success('Duyệt yêu cầu hủy thành công.');
              this.isProcessing = false;
            },
            error: (err) => {
              this.messageService.error(err.error?.message || 'Có lỗi xảy ra.');
              this.isProcessing = false;
            },
          });
      },
    });
  }

  rejectCancellation(): void {
    if (!this.detail || this.isProcessing) return;

    this.modalService.confirm({
      nzTitle: 'Xác nhận từ chối yêu cầu hủy?',
      nzContent:
        'Hành động này sẽ hoàn trả trạng thái booking về "Đã xác nhận".',
      nzOkText: 'Xác nhận',
      nzCancelText: 'Hủy bỏ',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isProcessing = true;
        this.accountantService
          .rejectCancellation(this.detail!.bookingId)
          .subscribe({
            next: (updatedDetail) => {
              this.detail = updatedDetail;
              this.messageService.success('Đã từ chối yêu cầu hủy.');
              this.isProcessing = false;
            },
            error: (err) => {
              this.messageService.error(err.error?.message || 'Có lỗi xảy ra.');
              this.isProcessing = false;
            },
          });
      },
    });
  }

  openCreateBillModal(): void {
    if (!this.detail) return;

    const modal = this.modalService.create({
      nzTitle: 'Tạo Phiếu Hoàn Tiền',
      nzContent: CreateRefundBillModalComponent,
      nzWidth: '600px',
      nzData: {
        bookingDetail: this.detail,
      },
      nzFooter: null,
    });

    modal.afterClose.subscribe((result: BookingRefundDetail | null) => {
      if (result) {
        this.detail = result;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CANCEL_REQUESTED':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      case 'REFUNDED':
        return 'green';
      case 'CONFIRMED':
        return 'blue';
      default:
        return 'default';
    }
  }
}
