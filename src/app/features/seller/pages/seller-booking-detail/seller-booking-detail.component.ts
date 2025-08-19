import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

// --- [THÊM MỚI] Imports cho các module của NG-ZORRO ---
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

// --- Imports từ project của bạn ---
import { SellerBookingService } from '../../services/seller-booking.service';
import { SellerBookingDetail } from '../../models/seller-booking-detail.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { StatusVietnamesePipe } from '../../../../shared/pipes/status-vietnamese.pipe';
import { BookingRequestCustomer } from '../../models/booking-request-customer.model';
import { SellerBookingUpdateRequest } from '../../models/seller-booking-update-request.model';
import { SellerBookingCustomer } from '../../models/seller-booking-customer.model';
import { SellerMailRequest } from '../../models/seller-mail-request.model';
import { BookingStatus } from '../../../../core/models/enums';
import { CustomValidators } from '../../../../core/validators/custom-validators';

@Component({
  selector: 'app-seller-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // Pipes
    FormatDatePipe,
    CurrencyVndPipe,
    StatusVietnamesePipe,
    TitleCasePipe,
    // NG-ZORRO Modules
    NzModalModule,
    NzSelectModule,
    NzInputModule,
    NzFormModule,
    NzButtonModule,
    NzCheckboxModule,
    NzTableModule,
    NzDividerModule,
    NzIconModule,
    NzSpinModule,
    NzGridModule,
    NzCardModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTagModule,
    NzPopconfirmModule,
  ],
  templateUrl: './seller-booking-detail.component.html',
})
export class SellerBookingDetailComponent implements OnInit {
  // Dependency Injection using inject()
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sellerService = inject(SellerBookingService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  booking?: SellerBookingDetail;
  isLoading = true;
  bookingId!: number;

  bookerForm!: FormGroup;
  isAddCustomerModalOpen = false;
  addCustomerForm!: FormGroup;
  isEditCustomerModalOpen = false;
  editCustomerForm!: FormGroup;
  editingCustomer: SellerBookingCustomer | null = null;
  isSubmitting = false;
  isMailModalOpen = false;
  isSendingMail = false;
  mailForm!: FormGroup;
  currentScheduleId: number | null = null;
  selectedScheduleSeats: number | null = null;

  constructor() {
    this.bookerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, CustomValidators.vietnamesePhone]],
      address: ['', Validators.required],
      paymentDeadline: ['', CustomValidators.noPastDateTime],
    });
    this.mailForm = this.fb.group({
      email: [{ value: '', disabled: true }, Validators.required],
      subject: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bookingId = +idParam;
      this.loadBookingDetail();
      this.initForms();
    } else {
      this.router.navigate(['/seller/dashboard']);
    }
  }

  initForms(): void {
    this.addCustomerForm = this.fb.group({ customers: this.fb.array([]) });
    this.editCustomerForm = this.createCustomerFormGroup();
  }

  loadBookingDetail(): void {
    this.isLoading = true;
    this.sellerService
      .getBookingDetail(this.bookingId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.booking = res.data;
          if (this.booking) {
            this.booking.totalAmount = Math.max(0, this.booking.totalAmount);
            const currentSchedule = this.booking.schedules.find(
              (s) =>
                new Date(s.departureDate).toISOString().slice(0, 10) ===
                new Date(this.booking!.departureDate).toISOString().slice(0, 10)
            );
            this.currentScheduleId = currentSchedule
              ? currentSchedule.id
              : null;
            this.bookerForm.patchValue({
              fullName: this.booking.customerName,
              email: this.booking.email,
              phone: this.booking.phoneNumber,
              address: this.booking.address,
              paymentDeadline: this.booking.paymentDeadline
                ? new Date(this.booking.paymentDeadline)
                    .toISOString()
                    .slice(0, 16)
                : '',
            });
          }
        },
        error: () => {
          this.message.error('Không thể tải thông tin booking.');
          this.router.navigate(['/seller/dashboard']);
        },
      });
  }

  onDepartureDateChange(newScheduleId: number): void {
    if (
      !newScheduleId ||
      !this.booking ||
      newScheduleId === this.currentScheduleId
    )
      return;

    this.selectedScheduleSeats =
      this.booking.schedules.find((s) => s.id === newScheduleId)
        ?.availableSeats ?? null;
    const newSchedule = this.booking.schedules.find(
      (s) => s.id === newScheduleId
    );
    if (!newSchedule) return;

    this.modal.confirm({
      nzTitle: 'Xác nhận đổi ngày khởi hành',
      nzContent: `Bạn có chắc chắn muốn đổi ngày khởi hành sang ${new Date(
        newSchedule.departureDate
      ).toLocaleDateString('vi-VN')} không?`,
      nzOnOk: () => {
        this.isLoading = true;
        this.sellerService
          .updateBookingSchedule(this.booking!.id, newScheduleId)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: (res) => {
              this.message.success('Đổi ngày khởi hành thành công!');
              this.booking = res.data;
              this.currentScheduleId = newScheduleId;
            },
            error: (err) => {
              this.message.error(
                err.error.message || 'Không thể cập nhật ngày khởi hành.'
              );
              this.loadBookingDetail();
            },
          });
      },
      nzOnCancel: () => {
        this.currentScheduleId =
          this.booking?.schedules.find(
            (s) =>
              new Date(s.departureDate).toISOString().slice(0, 10) ===
              new Date(this.booking!.departureDate).toISOString().slice(0, 10)
          )?.id ?? null;
        this.selectedScheduleSeats = null;
      },
    });
  }

  onSaveChanges(): void {
    if (this.bookerForm.invalid) {
      Object.values(this.bookerForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.isSubmitting = true;
    const formData = this.bookerForm.value;
    const requestData: SellerBookingUpdateRequest = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      paymentDeadline: new Date(formData.paymentDeadline).toISOString(),
    };
    this.sellerService
      .updateBookedPerson(this.bookingId, requestData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          this.message.success('Cập nhật thông tin thành công!');
          this.booking = res.data;
          this.bookerForm.markAsPristine();
        },
        error: (err) =>
          this.message.error(err.error.message || 'Không thể cập nhật.'),
      });
  }

  get customersArray(): FormArray {
    return this.addCustomerForm.get('customers') as FormArray;
  }

  createCustomerFormGroup(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      gender: ['MALE', Validators.required],
      dateOfBirth: ['', [Validators.required, CustomValidators.noFutureDate]],
      paxType: ['ADULT', Validators.required],
      singleRoom: [false],
    });
  }

  openAddCustomerModal(): void {
    this.customersArray.clear();
    this.customersArray.push(this.createCustomerFormGroup());
    this.isAddCustomerModalOpen = true;
  }

  closeAddCustomerModal(): void {
    this.isAddCustomerModalOpen = false;
  }

  addMoreCustomer(): void {
    this.customersArray.push(this.createCustomerFormGroup());
  }

  removeCustomerFromAddForm(index: number): void {
    this.customersArray.removeAt(index);
  }

  onSubmitAddCustomer(): void {
    if (
      this.addCustomerForm.invalid ||
      !this.booking ||
      !this.currentScheduleId
    )
      return;
    this.isSubmitting = true;
    const newCustomers: BookingRequestCustomer[] =
      this.addCustomerForm.value.customers;
    this.sellerService
      .addCustomersToSchedule(
        this.booking.id,
        this.currentScheduleId,
        newCustomers
      )
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.message.success('Thêm khách hàng thành công!');
          this.closeAddCustomerModal();
          this.loadBookingDetail();
        },
        error: (err) =>
          this.message.error(err.error.message || 'Không thể thêm khách hàng.'),
      });
  }

  openEditCustomerModal(customer: SellerBookingCustomer): void {
    this.editingCustomer = customer;
    this.editCustomerForm.patchValue({
      ...customer,
      dateOfBirth: new Date(customer.dateOfBirth).toISOString().split('T')[0],
    });
    this.isEditCustomerModalOpen = true;
  }

  closeEditCustomerModal(): void {
    this.isEditCustomerModalOpen = false;
    this.editingCustomer = null;
  }

  onSubmitEditCustomer(): void {
    if (this.editCustomerForm.invalid || !this.editingCustomer) return;
    this.isSubmitting = true;
    const customerData = this.editCustomerForm.value;
    this.sellerService
      .updateCustomer(this.editingCustomer.id, customerData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          this.message.success('Cập nhật khách hàng thành công!');
          this.booking = res.data;
          this.closeEditCustomerModal();
        },
        error: (err) =>
          this.message.error(
            err.error.message || 'Không thể cập nhật khách hàng.'
          ),
      });
  }

  onDeleteCustomer(customerId: number): void {
    this.sellerService.deleteCustomer(customerId).subscribe({
      next: () => {
        this.message.success('Xóa khách hàng thành công!');
        this.loadBookingDetail();
      },
      error: (err) =>
        this.message.error(err.error.message || 'Không thể xóa khách hàng.'),
    });
  }

  openMailModal(): void {
    if (!this.booking) return;
    const totalGuests =
      (this.booking.adults || 0) +
      (this.booking.children || 0) +
      (this.booking.infants || 0);
    const subject = `Xác nhận Booking #${this.booking.bookingCode} - Tour ${this.booking.tourName}`;
    const content = `Kính gửi ${
      this.booking.customerName
    },\n\nCảm ơn bạn đã đặt tour tại Đi Đâu. Chúng tôi xin xác nhận thông tin booking của bạn như sau:\n\n- Mã booking: ${
      this.booking.bookingCode
    }\n- Tên tour: ${this.booking.tourName}\n- Ngày khởi hành: ${new Date(
      this.booking.departureDate
    ).toLocaleDateString(
      'vi-VN'
    )}\n- Tổng số khách: ${totalGuests} người\n- Tổng thanh toán: ${new Intl.NumberFormat(
      'vi-VN',
      { style: 'currency', currency: 'VND' }
    ).format(
      this.booking.totalAmount
    )}\n\nVui lòng kiểm tra lại thông tin chi tiết và liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào. Nếu bạn chưa thanh toán, vui lòng thanh toán cho chúng tôi trước ngày khởi hành 3 ngày nếu không booking sẽ bị hủy.\n\nTrân trọng,\nĐội ngũ Đi Đâu.`.trim();
    this.mailForm.setValue({
      email: this.booking.email,
      subject: subject,
      content: content,
    });
    this.isMailModalOpen = true;
  }

  closeMailModal(): void {
    this.isMailModalOpen = false;
  }

  onSendMail(): void {
    if (this.mailForm.invalid) {
      Object.values(this.mailForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.isSendingMail = true;
    const mailData: SellerMailRequest = this.mailForm.getRawValue();
    this.sellerService
      .sendCustomEmail(mailData)
      .pipe(finalize(() => (this.isSendingMail = false)))
      .subscribe({
        next: () => {
          this.message.success('Gửi email thành công!');
          this.closeMailModal();
        },
        error: (err) =>
          this.message.error(err.error.message || 'Không thể gửi email.'),
      });
  }

  goBack(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'CONFIRMED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  }
}
