import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// NG-ZORRO Imports
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';

// Custom Imports
import { SellerBookingService } from '../../services/seller-booking.service';
import { RequestBookingDetail } from '../../models/request-booking-detail.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { StatusVietnamesePipe } from '../../../../shared/pipes/status-vietnamese.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';

@Component({
  selector: 'app-seller-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    FormatDatePipe,
    StatusVietnamesePipe,
    CurrencyVndPipe,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzCardModule,
    NzGridModule,
    NzDescriptionsModule,
    NzSpinModule,
    NzButtonModule,
    NzTagModule,
    NzModalModule,
    NzInputModule,
    NzPopconfirmModule,
    NzIconModule,
  ],
  templateUrl: './seller-request-detail.component.html',
})
export class SellerRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private sellerService = inject(SellerBookingService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  isLoading = signal(true);
  requestDetail = signal<RequestBookingDetail | null>(null);
  requestId!: number;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.requestId = +idParam;
      this.loadRequestDetail();
    } else {
      this.message.error('Không tìm thấy mã yêu cầu.');
      this.router.navigate(['/seller/requests']);
    }
  }

  loadRequestDetail(): void {
    this.isLoading.set(true);
    this.sellerService
      .getRequestDetail(this.requestId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.requestDetail.set(res.data);
          } else {
            this.message.error(res.message || 'Tải chi tiết yêu cầu thất bại.');
          }
        },
        error: (err) =>
          this.message.error(err.error?.message || 'Đã có lỗi xảy ra.'),
      });
  }

  onApprove(): void {
    this.sellerService.approveRequestBooking(this.requestId).subscribe({
      next: (res) => {
        if (res.data) {
          this.message.success('Duyệt yêu cầu thành công!');
          this.loadRequestDetail();
        } else {
          this.message.error(res.message || 'Duyệt yêu cầu thất bại.');
        }
      },
      error: (err) =>
        this.message.error(err.error?.message || 'Đã xảy ra lỗi.'),
    });
  }

  showRejectModal(): void {
    const modalRef = this.modal.create({
      nzTitle: 'Xác nhận từ chối yêu cầu',
      nzContent: RejectReasonModalComponent,
      nzFooter: [
        {
          label: 'Hủy',
          onClick: () => modalRef.destroy(),
        },
        {
          label: 'Xác nhận từ chối',
          type: 'primary',
          danger: true,
          onClick: (componentInstance) => {
            if (componentInstance) {
              componentInstance.submitForm();
            }
          },
        },
      ],
    });

    modalRef.afterClose.subscribe((reason) => {
      if (reason) {
        this.onReject(reason);
      }
    });
  }

  private onReject(reason: string): void {
    this.sellerService.rejectRequestBooking(this.requestId, reason).subscribe({
      next: (res) => {
        if (res.data) {
          this.message.success('Đã từ chối yêu cầu thành công!');
          this.loadRequestDetail();
        } else {
          this.message.error(res.message || 'Từ chối yêu cầu thất bại.');
        }
      },
      error: (err) =>
        this.message.error(err.error?.message || 'Đã xảy ra lỗi.'),
    });
  }
}

// Helper component for the rejection reason modal
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    ReactiveFormsModule,
    NzFormModule,
  ],
  template: `
    <form [formGroup]="reasonForm" class="mt-4">
      <p>
        Vui lòng nhập lý do từ chối yêu cầu này. Lý do sẽ được gửi cho khách
        hàng.
      </p>
      <textarea
        nz-input
        formControlName="reason"
        placeholder="VD: Không đủ nguồn lực để đáp ứng..."
        [nzAutosize]="{ minRows: 3, maxRows: 5 }"
      ></textarea>
      <div
        *ngIf="
          reasonForm.get('reason')?.invalid &&
          (reasonForm.get('reason')?.dirty || reasonForm.get('reason')?.touched)
        "
        class="text-red-500 text-xs mt-1"
      >
        Lý do không được để trống.
      </div>
    </form>
  `,
})
export class RejectReasonModalComponent {
  private fb = inject(FormBuilder);
  private modal = inject(NzModalRef);
  reasonForm: FormGroup;

  constructor() {
    this.reasonForm = this.fb.group({
      reason: ['', Validators.required],
    });
  }

  submitForm(): void {
    if (this.reasonForm.valid) {
      this.modal.close(this.reasonForm.value.reason);
    } else {
      Object.values(this.reasonForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
