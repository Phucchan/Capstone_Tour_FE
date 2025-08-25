/*
----------------------------------------------------------------
-- File: src/app/features/accountant/pages/booking-settlement/booking-settlement.component.ts
-- Ghi chú: Component trang chi tiết quyết toán booking. (Đã cập nhật)
----------------------------------------------------------------
*/
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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { AccountantService } from '../../services/accountant.service';
import { BookingSettlement } from '../../models/booking-settlement.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { BillTableComponent } from '../../components/bill-table/bill-table.component';
import { CreateBillModalComponent } from '../../components/create-bill-modal/create-bill-modal.component';
import { PaymentType } from '../../../../core/models/enums';
import { StatusVietnamesePipe } from '../../../../shared/pipes/status-vietnamese.pipe';


@Component({
  selector: 'app-booking-settlement',
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
    NzTableModule,
    NzTabsModule,
    FormatDatePipe,
    CurrencyVndPipe,
    BillTableComponent,
    StatusVietnamesePipe,
  ],
  templateUrl: './booking-settlement.component.html',

})
export class BookingSettlementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountantService = inject(AccountantService);
  private modalService = inject(NzModalService);
  private messageService = inject(NzMessageService);

  detail: BookingSettlement | null = null;
  isLoading = true;
  isProcessing = false;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isLoading = true;
            return this.accountantService.getBookingSettlement(+id);
          }
          this.router.navigate(['/accountant/bookings']);
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
          this.messageService.error('Không thể tải chi tiết quyết toán.');
          this.router.navigate(['/accountant/bookings']);
        },
      });
  }

  openCreateBillModal(type: 'receipt' | 'payment'): void {
    if (!this.detail) return;

    const modal = this.modalService.create({
      nzTitle: type === 'receipt' ? 'Tạo Phiếu Thu' : 'Tạo Phiếu Chi',
      nzContent: CreateBillModalComponent,
      nzWidth: '600px',
      nzZIndex: 1100,
      nzData: {
        bookingDetail: this.detail,
        billType:
          type === 'receipt' ? PaymentType.RECEIPT : PaymentType.PAYMENT,
      },
      nzFooter: [
        {
          label: 'Hủy',
          onClick: () => modal.destroy(),
        },
        {
          label: 'Tạo Phiếu',
          type: 'primary',
          loading: false,
          onClick: (contentComponentInstance: CreateBillModalComponent) => {
            return new Promise((resolve) => {
              contentComponentInstance
                .submitForm()
                .then((success: BookingSettlement | null) => {
                  if (success) {
                    this.detail = success;
                    modal.destroy();
                  }
                  resolve(undefined);
                });
            });
          },
        },
      ],
    });
  }

  markBillAsPaid(billId: number): void {
    this.modalService.confirm({
      nzTitle: 'Xác nhận thanh toán?',
      nzContent: 'Hành động này sẽ đánh dấu phiếu này đã được thanh toán.',
      nzOnOk: () => {
        this.accountantService.markBillPaid(billId).subscribe({
          next: () => {
            this.messageService.success('Đánh dấu thanh toán thành công.');
            // Tải lại dữ liệu để cập nhật trạng thái
            this.ngOnInit();
          },
          error: (err) => {
            this.messageService.error(err.error?.message || 'Có lỗi xảy ra.');
          },
        });
      },
    });
  }

  completeBooking(): void {
    if (!this.detail || this.isProcessing) return;

    this.modalService.confirm({
      nzTitle: 'Xác nhận hoàn tất booking?',
      nzContent: 'Hành động này sẽ đánh dấu booking đã được quyết toán xong.',
      nzOnOk: () => {
        this.isProcessing = true;
        this.accountantService
          .markBookingCompleted(this.detail!.bookingId)
          .subscribe({
            next: () => {
              this.messageService.success('Booking đã được hoàn tất.');
              this.isProcessing = false;
              this.ngOnInit(); // Tải lại dữ liệu
            },
            error: (err) => {
              this.messageService.error(err.error?.message || 'Có lỗi xảy ra.');
              this.isProcessing = false;
            },
          });
      },
    });
  }

  getStatusColor(status: string): string {
    if (!status) return 'default';

    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'red';
      case 'CANCEL_REQUESTED':
        return 'orange';
      case 'PENDING':
        return 'gold';
      default:
        return 'default';
    }
  }
}
