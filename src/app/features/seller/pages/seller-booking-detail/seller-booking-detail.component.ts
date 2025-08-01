import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SellerBookingService } from '../../services/seller-booking.service';
import { SellerBookingDetail } from '../../models/seller-booking-detail.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import {
  FormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TourSchedule } from '../../../../core/models/tour-schedule.model';
import { BookingRequestCustomer } from '../../models/booking-request-customer.model';

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
  ],
  templateUrl: './seller-booking-detail.component.html',
})
export class SellerBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sellerService = inject(SellerBookingService);
  private fb = inject(FormBuilder); // Inject FormBuilder

  booking: SellerBookingDetail | null = null;
  isLoading = true;
  bookingId!: number;
  selectedScheduleId: number | null = null;

  // --- Logic cho modal Thêm khách hàng ---
  isAddCustomerModalOpen = false;
  customerForm!: FormGroup;
  isSubmitting = false;

  ngOnInit(): void {
    // Lấy ID từ URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bookingId = +idParam;
      this.loadBookingDetail();
      this.initCustomerForm();
    } else {
      // Xử lý trường hợp không có ID, ví dụ: quay về dashboard
      this.router.navigate(['/seller/dashboard']);
    }
  }

  // Khởi tạo form thêm khách hàng
  initCustomerForm(): void {
    this.customerForm = this.fb.group({
      customers: this.fb.array([]),
    });
  }

  // Getter để dễ dàng truy cập vào FormArray
  get customers(): FormArray {
    return this.customerForm.get('customers') as FormArray;
  }

  // Tạo một FormGroup cho một khách hàng
  createCustomerFormGroup(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      gender: ['MALE', Validators.required],
      dateOfBirth: ['', Validators.required],
      paxType: ['ADULT', Validators.required],
      singleRoom: [false],
    });
  }

  // Thêm một form group khách hàng mới vào FormArray
  addCustomer(): void {
    this.customers.push(this.createCustomerFormGroup());
  }

  // Xóa một khách hàng khỏi FormArray
  removeCustomer(index: number): void {
    this.customers.removeAt(index);
  }

  // Mở modal và thêm sẵn 1 khách hàng vào form
  openAddCustomerModal(): void {
    this.customers.clear(); // Xóa hết các khách hàng cũ
    this.addCustomer(); // Thêm một khách hàng mới mặc định
    this.isAddCustomerModalOpen = true;
  }

  // Đóng modal
  closeAddCustomerModal(): void {
    this.isAddCustomerModalOpen = false;
  }

  // Xử lý submit form
  onSubmitAddCustomer(): void {
    if (this.customerForm.invalid) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng.');
      return;
    }
    if (!this.booking || !this.booking.schedules) return;

    this.isSubmitting = true;
    const newCustomers: BookingRequestCustomer[] =
      this.customerForm.value.customers;
    const currentScheduleId = this.booking.schedules.find(
      (s) => s.departureDate === this.booking?.departureDate
    )?.id;

    if (!currentScheduleId) {
      alert('Không tìm thấy lịch trình hiện tại của booking.');
      this.isSubmitting = false;
      return;
    }

    this.sellerService
      .addCustomersToSchedule(this.booking.id, currentScheduleId, newCustomers)
      .subscribe({
        next: () => {
          alert('Thêm khách hàng thành công!');
          this.isSubmitting = false;
          this.closeAddCustomerModal();
          this.loadBookingDetail(); // Tải lại thông tin để cập nhật số chỗ
        },
        error: (err) => {
          this.isSubmitting = false;
          alert(`Lỗi: ${err.error.message || 'Không thể thêm khách hàng.'}`);
        },
      });
  }

  loadBookingDetail(): void {
    this.isLoading = true;
    this.sellerService.getBookingDetail(this.bookingId).subscribe({
      next: (res) => {
        this.booking = res.data;
        // Gán giá trị ban đầu cho dropdown
        this.selectedScheduleId =
          this.booking.schedules.find(
            (s) => s.departureDate === this.booking?.departureDate
          )?.id || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load booking detail:', err);
        this.isLoading = false;
        alert('Không thể tải thông tin booking.');
        this.router.navigate(['/seller/dashboard']);
      },
    });
  }

  onScheduleChange(): void {
    if (!this.selectedScheduleId || !this.booking) {
      return;
    }

    if (confirm('Bạn có chắc chắn muốn đổi ngày khởi hành cho booking này?')) {
      this.sellerService
        .updateBookingSchedule(this.booking.id, this.selectedScheduleId)
        .subscribe({
          next: (res) => {
            alert('Cập nhật ngày khởi hành thành công!');
            this.booking = res.data; // Cập nhật lại dữ liệu trên view
          },
          error: (err) => {
            alert(`Lỗi: ${err.error.message || 'Không thể cập nhật.'}`);
            // Reset lại dropdown về giá trị cũ
            this.selectedScheduleId =
              this.booking?.schedules.find(
                (s) => s.departureDate === this.booking?.departureDate
              )?.id || null;
          },
        });
    } else {
      // Nếu người dùng hủy, reset lại dropdown
      this.selectedScheduleId =
        this.booking?.schedules.find(
          (s) => s.departureDate === this.booking?.departureDate
        )?.id || null;
    }
  }

  // Hàm trợ giúp để lấy thông tin schedule đã chọn
  getSelectedScheduleInfo(): TourSchedule | undefined {
    return this.booking?.schedules.find(
      (s) => s.id === this.selectedScheduleId
    );
  }
}
