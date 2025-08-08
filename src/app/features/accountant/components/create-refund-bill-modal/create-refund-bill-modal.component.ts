/*
----------------------------------------------------------------
-- File: src/app/features/accountant/components/create-refund-bill-modal/create-refund-bill-modal.component.ts
-- Ghi chú: Component cho modal tạo phiếu chi.
----------------------------------------------------------------
*/
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BookingRefundDetail } from '../../models/booking-refund-detail.model';
import { AccountantService } from '../../services/accountant.service';
import {
  PaymentMethod,
  PaymentType,
  PaymentBillItemStatus,
} from '../../../../core/models/enums';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

@Component({
  selector: 'app-create-refund-bill-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
  ],
  templateUrl: './create-refund-bill-modal.component.html',
})
export class CreateRefundBillModalComponent implements OnInit {
  @Input() bookingDetail!: BookingRefundDetail;

  private fb = inject(FormBuilder);
  private accountantService = inject(AccountantService);
  private messageService = inject(NzMessageService);
  private currentUserService = inject(CurrentUserService);

  validateForm!: FormGroup;
  paymentMethods = Object.values(PaymentMethod);

  ngOnInit(): void {
    const currentUser = this.currentUserService.getCurrentUser();
    this.validateForm = this.fb.group({
      payTo: [this.bookingDetail.customerName, [Validators.required]],
      paidBy: [currentUser?.fullName || '', [Validators.required]],
      createdDate: [new Date(), [Validators.required]],
      paymentMethod: [PaymentMethod.BANK_TRANSFER, [Validators.required]],
      note: [null],
      content: [
        `Hoàn tiền cho booking #${this.bookingDetail.bookingCode}`,
        [Validators.required],
      ],
      amount: [
        this.bookingDetail.refundAmount,
        [Validators.required, Validators.min(1)],
      ],
    });
  }

  async submitForm(): Promise<BookingRefundDetail | null> {
    if (this.validateForm.valid) {
      try {
        const formValue = this.validateForm.value;
        const request = {
          ...formValue,
          createdDate: formValue.createdDate.toISOString(),
          paymentType: PaymentType.REFUND,
          unitPrice: formValue.amount,
          quantity: 1,
          discount: 0,
          status: PaymentBillItemStatus.PAID,
        };
        const result = await this.accountantService
          .createRefundBill(this.bookingDetail.bookingId, request)
          .toPromise();
        this.messageService.success('Tạo phiếu hoàn tiền thành công!');
        return result!;
      } catch (err: any) {
        this.messageService.error(
          err.error?.message || 'Có lỗi xảy ra khi tạo phiếu.'
        );
        return null;
      }
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return null;
    }
  }
}
