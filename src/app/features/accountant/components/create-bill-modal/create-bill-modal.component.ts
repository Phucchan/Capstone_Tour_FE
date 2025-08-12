/*
----------------------------------------------------------------
-- File: src/app/features/accountant/components/create-bill-modal/create-bill-modal.component.ts
-- Ghi chú: Component cho modal tạo phiếu thu/chi.
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
import { AccountantService } from '../../services/accountant.service';
import { PaymentMethod, PaymentType } from '../../../../core/models/enums';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { BookingSettlement } from '../../models/booking-settlement.model';

@Component({
  selector: 'app-create-bill-modal',
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
  templateUrl: './create-bill-modal.component.html',
})
export class CreateBillModalComponent implements OnInit {
  @Input() bookingDetail!: BookingSettlement;
  @Input() billType!: PaymentType;

  private fb = inject(FormBuilder);
  private accountantService = inject(AccountantService);
  private messageService = inject(NzMessageService);
  private currentUserService = inject(CurrentUserService);

  validateForm!: FormGroup;
  paymentMethods = Object.values(PaymentMethod);
  isReceipt(): boolean {
    return this.billType === PaymentType.RECEIPT;
  }

  // Ghi chú: Sửa kiểu trả về của parserVND thành number
  formatterVND = (value: number): string =>
    value ? `${value.toLocaleString('vi-VN')} ₫` : '';
  parserVND = (value: string): number =>
    parseFloat(value.replace(' ₫', '').replace(/,/g, ''));

  ngOnInit(): void {
    const currentUser = this.currentUserService.getCurrentUser();
    this.validateForm = this.fb.group({
      payTo: [this.isReceipt() ? 'Công ty' : null, [Validators.required]],
      paidBy: [
        this.isReceipt() ? null : currentUser?.fullName || '',
        [Validators.required],
      ],
      createdDate: [new Date(), [Validators.required]],
      paymentMethod: [PaymentMethod.BANK_TRANSFER, [Validators.required]],
      note: [null],
      content: [
        `Thanh toán cho booking #${this.bookingDetail.bookingCode}`,
        [Validators.required],
      ],
      amount: [null, [Validators.required, Validators.min(1)]],
    });
  }

  async submitForm(): Promise<BookingSettlement | null> {
    if (this.validateForm.valid) {
      try {
        const formValue = this.validateForm.value;
        const request = {
          ...formValue,
          createdDate: formValue.createdDate.toISOString(),
          paymentType: this.billType,
          unitPrice: formValue.amount,
          quantity: 1,
          discount: 0,
        };

        const result = this.isReceipt()
          ? await this.accountantService
              .createReceiptBill(this.bookingDetail.bookingId, request)
              .toPromise()
          : await this.accountantService
              .createPaymentBill(this.bookingDetail.bookingId, request)
              .toPromise();

        this.messageService.success('Tạo phiếu thành công!');
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
