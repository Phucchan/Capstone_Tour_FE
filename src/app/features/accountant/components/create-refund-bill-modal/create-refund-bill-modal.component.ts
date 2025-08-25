import { Component, OnInit, inject, Inject } from '@angular/core';
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
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { BookingRefundDetail } from '../../models/booking-refund-detail.model';
import { AccountantService } from '../../services/accountant.service';
import { PaymentMethod, PaymentType } from '../../../../core/models/enums';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { CreateBillRequest } from '../../models/create-bill-request.model';

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
    NzButtonModule,
  ],
  templateUrl: './create-refund-bill-modal.component.html',
})
export class CreateRefundBillModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountantService = inject(AccountantService);
  private messageService = inject(NzMessageService);
  private currentUserService = inject(CurrentUserService);
  private modal = inject(NzModalRef);

  validateForm!: FormGroup;
  paymentMethods = Object.values(PaymentMethod);
  isSubmitting = false;

  formatterVND = (value: number): string =>
    value ? `${value.toLocaleString('vi-VN')} ₫` : '';
  parserVND = (value: string): number =>
    parseFloat(value.replace(' ₫', '').replace(/,/g, ''));

  constructor(
    @Inject(NZ_MODAL_DATA) public data: { bookingDetail: BookingRefundDetail }
  ) {}

  ngOnInit(): void {
    const currentUser = this.currentUserService.getCurrentUser();
    this.validateForm = this.fb.group({
      payTo: [this.data.bookingDetail.customerName, [Validators.required]],
      paidBy: [currentUser?.fullName || '', [Validators.required]],
      createdDate: [new Date(), [Validators.required]],
      paymentMethod: [PaymentMethod.BANK_TRANSFER, [Validators.required]],
      note: [null],
      content: [
        `Hoàn tiền cho booking #${this.data.bookingDetail.bookingCode}`,
        [Validators.required],
      ],
      amount: [
        { value: this.data.bookingDetail.refundAmount, disabled: true },
        [Validators.required],
      ],
    });
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.isSubmitting = true;
      const formValue = this.validateForm.getRawValue();

      const request: CreateBillRequest = {
        payTo: formValue.payTo,
        paidBy: formValue.paidBy,
        createdDate: new Date(formValue.createdDate).toISOString(),
        paymentType: PaymentType.REFUND,
        paymentMethod: formValue.paymentMethod,
        note: formValue.note,
        content: formValue.content,
      };

      this.accountantService
        .createRefundBill(this.data.bookingDetail.bookingId, request)
        .subscribe({
          next: (result) => {
            this.messageService.success('Tạo phiếu hoàn tiền thành công!');
            this.isSubmitting = false;
            this.modal.close(result);
          },
          error: (err) => {
            this.messageService.error(
              err.error?.message || 'Có lỗi xảy ra khi tạo phiếu.'
            );
            this.isSubmitting = false;
          },
        });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  destroyModal(): void {
    this.modal.destroy();
  }
}
