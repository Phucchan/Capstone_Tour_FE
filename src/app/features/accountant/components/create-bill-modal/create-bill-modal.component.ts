import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { AccountantService } from '../../services/accountant.service';
import { PaymentMethod, PaymentType } from '../../../../core/models/enums';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { BookingSettlement } from '../../models/booking-settlement.model';
import { CreateBillRequest } from '../../models/create-bill-request.model';

interface CreateBillModalData {
  bookingDetail: BookingSettlement;
  billType: PaymentType;
}

@Component({
  selector: 'app-create-bill-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
  ],
  templateUrl: './create-bill-modal.component.html',
})
export class CreateBillModalComponent implements OnInit {
  private modalData: CreateBillModalData = inject(NZ_MODAL_DATA);
  private fb = inject(FormBuilder);
  private accountantService = inject(AccountantService);
  private messageService = inject(NzMessageService);
  private currentUserService = inject(CurrentUserService);

  validateForm!: FormGroup;
  paymentMethods = Object.values(PaymentMethod);

  get bookingDetail(): BookingSettlement {
    return this.modalData.bookingDetail;
  }

  get billType(): PaymentType {
    return this.modalData.billType;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const currentUser = this.currentUserService.getCurrentUser();
    this.validateForm = this.fb.group({
      payTo: [
        this.isReceipt() ? 'Công ty TNHH Du Lịch ABC' : null,
        [Validators.required],
      ],
      paidBy: [
        this.isReceipt() ? null : currentUser?.fullName || '',
        [Validators.required],
      ],
      createdDate: [new Date(), [Validators.required]],
      paymentMethod: [PaymentMethod.BANK_TRANSFER, [Validators.required]],
      note: [null],
      content: [
        this.isReceipt()
          ? `Thanh toán booking #${this.bookingDetail.bookingCode}`
          : `Chi trả dịch vụ cho booking #${this.bookingDetail.bookingCode}`,
        [Validators.required],
      ],
    });
  }

  isReceipt(): boolean {
    return this.billType === PaymentType.RECEIPT;
  }

  async submitForm(): Promise<BookingSettlement | null> {
    if (this.validateForm.valid) {
      try {
        const formValue = this.validateForm.value;

        const request: CreateBillRequest = {
          payTo: formValue.payTo,
          paidBy: formValue.paidBy,
          createdDate: formValue.createdDate.toISOString(),
          paymentType: this.billType,
          paymentMethod: formValue.paymentMethod,
          note: formValue.note,
          content: formValue.content,
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
