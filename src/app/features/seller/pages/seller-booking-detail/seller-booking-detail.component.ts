import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SellerBookingService } from '../../services/seller-booking.service';
import { SellerBookingDetail } from '../../models/seller-booking-detail.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TourSchedule } from '../../../../core/models/tour-schedule.model';
import { BookingRequestCustomer } from '../../models/booking-request-customer.model';
import { SellerBookingUpdateRequest } from '../../models/seller-booking-update-request.model';
import { SellerBookingCustomer } from '../../models/seller-booking-customer.model';
import { SellerMailRequest } from '../../models/seller-mail-request.model';
import { BookingStatus } from '../../../../core/models/enums';


@Component({
  selector: 'app-seller-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    FormatDatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CurrencyVndPipe,
  ],
  templateUrl: './seller-booking-detail.component.html',
})
export class SellerBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sellerService = inject(SellerBookingService);
  private fb = inject(FormBuilder);

  booking: SellerBookingDetail | null = null;
  isLoading = true;
  bookingId!: number;

  bookerForm!: FormGroup;

  // Modal thêm khách hàng
  isAddCustomerModalOpen = false;
  addCustomerForm!: FormGroup;

  // Modal Sửa khách hàng
  isEditCustomerModalOpen = false;
  editCustomerForm!: FormGroup;
  editingCustomer: SellerBookingCustomer | null = null;
  isSubmitting = false;

  // Modal Gửi Mail
  isMailModalOpen = false;
  isSendingMail = false;
  mailForm!: FormGroup;

  // Logic đổi ngày khởi hành
  currentScheduleId: number | null = null;
  selectedScheduleSeats: number | null = null;

  initialBookingStatus: string | null = null; // Lưu trạng thái ban đầu

  constructor() {
    this.bookerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      paymentDeadline: [''],
    });
    // Khởi tạo mailForm
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
      this.initForms(); // Khởi tạo tất cả các form
    } else {
      this.router.navigate(['/seller/dashboard']);
    }
  }

  initForms(): void {
    // Form thêm khách hàng
    this.addCustomerForm = this.fb.group({ customers: this.fb.array([]) });
    // Form sửa khách hàng
    this.editCustomerForm = this.createCustomerFormGroup();
  }

  loadBookingDetail(): void {
    this.isLoading = true;
    this.sellerService.getBookingDetail(this.bookingId).subscribe({
      next: (res) => {
        this.booking = res.data;
        this.initialBookingStatus = this.booking.status; // Lưu lại trạng thái ban đầu
        const currentSchedule = this.booking.schedules.find(
          (s) =>
            new Date(s.departureDate).toISOString().slice(0, 10) ===
            new Date(this.booking!.departureDate).toISOString().slice(0, 10)
        );
        this.currentScheduleId = currentSchedule ? currentSchedule.id : null;

        this.bookerForm.patchValue({
          fullName: this.booking.customerName,
          email: this.booking.email,
          phone: this.booking.phoneNumber,
          address: this.booking.address,
          paymentDeadline: this.booking.paymentDeadline
            ? new Date(this.booking.paymentDeadline).toISOString().slice(0, 16)
            : '',
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        alert('Không thể tải thông tin booking.');
        this.router.navigate(['/seller/dashboard']);
      },
    });
  }

  onUpdateStatus(): void {
    if (!this.booking || this.booking.status === this.initialBookingStatus) {
      return; // Không làm gì nếu trạng thái không đổi
    }
    if (
      confirm(
        `Bạn có chắc muốn cập nhật trạng thái thành "${this.booking.status}" không?`
      )
    ) {
      this.sellerService
        .updateBookingStatus(
          this.booking.id,
          this.booking.status as BookingStatus
        )
        .subscribe({
          next: (res) => {
            alert('Cập nhật trạng thái thành công!');
            this.booking = res.data;
            this.initialBookingStatus = this.booking.status;
          },
          error: (err) => {
            alert(`Lỗi: ${err.error.message || 'Không thể cập nhật.'}`);
            // Reset về trạng thái cũ nếu lỗi
            this.booking!.status = this.initialBookingStatus!;
          },
        });
    } else {
      // Reset về trạng thái cũ nếu hủy
      this.booking.status = this.initialBookingStatus!;
    }
  }

  // --- LOGIC ĐỔI NGÀY KHỞI HÀNH ---
  onDepartureDateChange(newScheduleId: number): void {
    if (!newScheduleId || !this.booking) return;

    // Cập nhật số chỗ trống hiển thị ngay lập tức
    this.selectedScheduleSeats =
      this.booking.schedules.find((s) => s.id === newScheduleId)
        ?.availableSeats ?? null;

    if (newScheduleId === this.currentScheduleId) return;

    const newSchedule = this.booking.schedules.find(
      (s) => s.id === newScheduleId
    );
    if (!newSchedule) return;

    const confirmation = confirm(
      `Bạn có chắc chắn muốn đổi ngày khởi hành sang ${new Date(
        newSchedule.departureDate
      ).toLocaleDateString('vi-VN')} không?`
    );

    if (confirmation) {
      this.isLoading = true;
      this.sellerService
        .updateBookingSchedule(this.booking.id, newScheduleId)
        .subscribe({
          next: (res) => {
            alert('Đổi ngày khởi hành thành công!');
            this.booking = res.data;
            this.currentScheduleId = newScheduleId;
            this.isLoading = false;
          },
          error: (err) => {
            this.isLoading = false;
            alert(
              `Lỗi: ${
                err.error.message || 'Không thể cập nhật ngày khởi hành.'
              }`
            );
            this.loadBookingDetail(); // Tải lại để reset về trạng thái cũ
          },
        });
    } else {
      setTimeout(() => {
        // Reset dropdown và số chỗ về giá trị ban đầu
        this.currentScheduleId =
          this.booking?.schedules.find(
            (s) =>
              new Date(s.departureDate).toISOString().slice(0, 10) ===
              new Date(this.booking!.departureDate).toISOString().slice(0, 10)
          )?.id ?? null;
        this.selectedScheduleSeats = null;
      }, 0);
    }
  }

  onSaveChanges(): void {
    if (this.bookerForm.invalid) return;
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
      .subscribe({
        next: (res) => {
          alert('Cập nhật thông tin thành công!');
          this.booking = res.data;
          this.bookerForm.markAsPristine();
        },
        error: (err) =>
          alert(`Lỗi: ${err.error.message || 'Không thể cập nhật.'}`),
      });
  }

  // --- LOGIC QUẢN LÝ KHÁCH HÀNG ---
  get customersArray(): FormArray {
    return this.addCustomerForm.get('customers') as FormArray;
  }

  createCustomerFormGroup(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      gender: ['MALE', Validators.required],
      dateOfBirth: ['', Validators.required],
      paxType: ['ADULT', Validators.required],
      singleRoom: [false],
      note: [''],
      pickUpAddress: [''],
    });
  }

  // Thêm khách hàng
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
    ) {
      return;
    }

    this.isSubmitting = true;
    const newCustomers: BookingRequestCustomer[] =
      this.addCustomerForm.value.customers;

    this.sellerService
      .addCustomersToSchedule(
        this.booking.id,
        this.currentScheduleId,
        newCustomers
      )
      .subscribe({
        next: () => {
          alert('Thêm khách hàng thành công!');
          this.isSubmitting = false;
          this.closeAddCustomerModal();
          this.loadBookingDetail();
        },
        error: (err) => {
          this.isSubmitting = false;
          alert(`Lỗi: ${err.error.message || 'Không thể thêm khách hàng.'}`);
        },
      });
  }

  // các hàm cho việc Sửa khách hàng
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
      .subscribe({
        next: (res) => {
          alert('Cập nhật khách hàng thành công!');
          this.booking = res.data;
          this.isSubmitting = false;
          this.closeEditCustomerModal();
        },
        error: (err) => {
          this.isSubmitting = false;
          alert(
            `Lỗi: ${err.error.message || 'Không thể cập nhật khách hàng.'}`
          );
        },
      });
  }

  onDeleteCustomer(customerId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này khỏi đoàn?')) {
      this.sellerService.deleteCustomer(customerId).subscribe({
        next: (res) => {
          alert('Xóa khách hàng thành công!');
          this.booking = res.data;
        },
        error: (err) =>
          alert(`Lỗi: ${err.error.message || 'Không thể xóa khách hàng.'}`),
      });
    }
  }

  // --- LOGIC GỬI MAIL ---
  openMailModal(): void {
    if (!this.booking) return;

    const subject = `Xác nhận Booking #${this.booking.bookingCode} - Tour ${this.booking.tourName}`;
    const content = `
Kính gửi ${this.booking.customerName},

Cảm ơn bạn đã đặt tour tại Đi Đâu. Chúng tôi xin xác nhận thông tin booking của bạn như sau:

- Mã booking: ${this.booking.bookingCode}
- Tên tour: ${this.booking.tourName}
- Ngày khởi hành: ${new Date(this.booking.departureDate).toLocaleDateString(
      'vi-VN'
    )}
- Tổng số khách: ${this.booking.customers.length} người // <--- SỬA LẠI TẠI ĐÂY
- Tổng thanh toán: ${new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(this.booking.totalAmount)}

Vui lòng kiểm tra lại thông tin chi tiết và liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào.

Trân trọng,
Đội ngũ Đi Đâu.
    `.trim();

    // Cập nhật giá trị cho form
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
    if (this.mailForm.invalid) return;
    this.isSendingMail = true;
    const mailData: SellerMailRequest = this.mailForm.getRawValue();
    this.sellerService.sendConfirmationEmail(mailData).subscribe({
      next: () => {
        this.isSendingMail = false;
        alert('Gửi email thành công!');
        this.closeMailModal();
      },
      error: (err) => {
        this.isSendingMail = false;
        alert(`Lỗi: ${err.error.message || 'Không thể gửi email.'}`);
      },
    });
  }
}
