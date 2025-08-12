import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RequestBookingService } from '../../services/request-booking.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { IconTransportPipe } from '../../../../shared/pipes/icon-transport.pipe';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { CustomerService } from '../../services/customer.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { subscribe } from 'diagnostics_channel';
import { take } from 'rxjs';

@Component({
  selector: 'app-request-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, IconTransportPipe, ReactiveFormsModule],
  templateUrl: './request-booking.component.html',
})
export class RequestBookingComponent implements OnInit {
  bookingForm!: FormGroup;

  transports = ['CAR', 'PLANE', 'TRAIN']; 
  autoFilled = false;


  hotelStandards = [
    { label: 'Tiêu chuẩn', value: 'Standard' },
    { label: 'Cao cấp', value: 'Deluxe' },
    { label: 'Suite', value: 'Suite' },
    { label: 'Gia đình', value: 'Family' }
  ];

  destinations: any[] = [];
  departures: any[] = [];
  themes: any[] = [];

  userInformation: any;
  isLoading: boolean = false;

  // min cho input date
  today = new Date().toISOString().slice(0, 10);

  // tránh double submit
  submitting = false;

  constructor(
    private tourService: RequestBookingService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private currentUserService: CurrentUserService,
    private customerService: CustomerService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadDestinations();
    this.loadDepartures();
    this.loadThemes();
    this.fillCurrentUser();
  }

  /** Build form + validators */
  buildForm(): void {
    this.bookingForm = this.fb.group(
      {
        destinationLocationIds: [[], Validators.required],
        departureLocationId: [null, Validators.required],
        destinationDetail: [''],

        startDate: ['', Validators.required],
        endDate: ['', Validators.required],

        transport: ['', Validators.required],

        adults: [1, [Validators.required, Validators.min(1)]],
        children: [0, [Validators.required, Validators.min(0)]],
        infants: [0, [Validators.required, Validators.min(0)]],
        toddlers: [0, [Validators.required, Validators.min(0)]],

        hotelRooms: [1, [Validators.required, Validators.min(1)]],
        roomCategory: ['', Validators.required],

        tourTheme: [''],                              // 🔹 thêm
        desiredServices: [''],

        customerName: ['', Validators.required],
        customerEmail: ['', [Validators.required, Validators.email]],
        // VN phone: 0 + 9 số
        customerPhone: ['', [Validators.required, Validators.pattern(/^(0\d{9})$/)]],

        priceMin: [0, [Validators.min(0)]],
        priceMax: [0, [Validators.required, Validators.min(0)]],

        status: ['PENDING'],                                 // 🔹 theo enum BE
        reason: ['']
      },
      {
        validators: [this.dateRangeValidator, this.priceRangeValidator],
      }
    );
  }

  /** endDate >= startDate */
  private dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) return null;

    // so sánh theo yyyy-MM-dd để tránh lệch múi giờ
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    return e.getTime() >= s.getTime() ? null : { dateRange: true };
  }

  /** priceMax >= priceMin */
  private priceRangeValidator(group: AbstractControl): ValidationErrors | null {
    const min = Number(group.get('priceMin')?.value || 0);
    const max = Number(group.get('priceMax')?.value || 0);
    if (!max && !min) return null; // không nhập cũng không báo lỗi
    return max >= min ? null : { priceRange: true };
  }

  /** Prefill thông tin KH từ user hiện tại */
fillCurrentUser(): void {
  const userId = this.currentUserService.getCurrentUser()?.id;
  if (!userId) return; // chưa đăng nhập thì thôi

  this.customerService.getUserProfile(userId)
    .pipe(take(1))
    .subscribe({
      next: (res) => {
        // BE của bạn trước đây hay trả { data: {...} }
        const user = (res && ('data' in res)) ? res.data : res;

        if (!user) return;
        this.bookingForm.patchValue({
          customerName: user.fullName || '',
          customerEmail: user.email || '',
          customerPhone: user.phone || '',
        });
        this.autoFilled = true; // nếu bạn có dùng cờ này
      },
      error: (err) => {
        console.error('Lỗi lấy thông tin user:', err);
        // Không chặn form; user vẫn có thể tự nhập tay
      }
    });
}

clearContactFields(): void {
  this.bookingForm.patchValue({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  this.autoFilled = false;
}




  /** Gọi dữ liệu chọn điểm đến/đi */
  loadDestinations() {
    this.tourService.getDestinations().subscribe((res) => {
      this.destinations = res.data;
    });
  }

  loadThemes() {
    this.tourService.getThemes().subscribe((res) => {
      this.themes = res.data;
    });
  }

  loadDepartures() {
    this.tourService.getDepartures().subscribe((res) => {
      this.departures = res.data;
    });
  }

  /** Tổng số khách */
  getTotalGuests(): number {
    const { adults, children, infants, toddlers } = this.bookingForm.value;
    return (adults || 0) + (children || 0) + (infants || 0) + (toddlers || 0);
  }

  /** Format hiển thị VND (không đổi CSS) */
  formatCurrency(value: number): string {
    return value?.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) || '';
  }

  /** Bắt input giá và set vào form (giữ hiển thị có phân cách) */
  onPriceInput(event: Event, type: 'min' | 'max') {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/[^\d]/g, '');
    const parsed = parseInt(raw, 10) || 0;

    if (type === 'min') {
      this.bookingForm.patchValue({ priceMin: parsed }, { emitEvent: false });
    } else {
      this.bookingForm.patchValue({ priceMax: parsed }, { emitEvent: false });
    }
    input.value = this.formatCurrency(parsed);
  }

  /** Submit */
  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.toastr.warning('Vui lòng điền đầy đủ thông tin yêu cầu');
      return;
    }

    // ✅ kiểm tra lỗi form-level đúng cách
    if (this.bookingForm.hasError('dateRange')) {
      this.toastr.error('Ngày về phải lớn hơn hoặc bằng ngày đi');
      return;
    }

    if (this.bookingForm.hasError('priceRange')) {
      this.toastr.error('Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu');
      return;
    }
    const userId = this.currentUserService.getCurrentUser()?.id || 0;
    if (!userId) {
      this.toastr.error('Không xác định được người dùng. Vui lòng đăng nhập lại.');
      return;
    }
    const toYmd = (v: string | null | undefined) =>
      v ? new Date(v).toISOString().split('T')[0] : null;

    const f = this.bookingForm.controls;
    this.submitting = true;

    const payload = {

      departureLocationId: Number(f['departureLocationId'].value),
      destinationLocationIds: f['destinationLocationIds'].value || [],
      destinationDetail: f['destinationDetail'].value || '',

      startDate: toYmd(f['startDate'].value),
      endDate: toYmd(f['endDate'].value),


      transport: f['transport'].value,
      tourTheme: f['tourTheme']?.value || '',
      desiredServices: f['desiredServices']?.value || '',

      adults: Number(f['adults'].value) || 1,
      children: Number(f['children'].value) || 0,
      infants: Number(f['infants'].value) || 0,
      toddlers: Number(f['toddlers'].value) || 0,

      hotelRooms: Number(f['hotelRooms'].value) || 1,
      roomCategory: f['roomCategory'].value,

      customerName: f['customerName'].value,
      customerEmail: f['customerEmail'].value,
      customerPhone: f['customerPhone'].value,

      priceMin: Number(f['priceMin'].value) || 0,
      priceMax: Number(f['priceMax'].value) || 0,


    };

    this.tourService.requestBooking(payload, userId).subscribe({
      next: () => {
        this.submitting = false;
        // Pop-up thông báo và điều hướng về homepage khi bấm xác nhận
        Swal.fire({
          icon: 'success',
          title: 'Đặt yêu cầu thành công!',
          text: 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
          confirmButtonText: 'Về trang chủ',
          allowOutsideClick: false,
          buttonsStyling: false,
          customClass: {
            popup: 'rounded-lg',
            confirmButton: 'swal-confirm-btn' // nếu bạn đã có class này
          }
        }).then(res => {
          if (res.isConfirmed) {
            this.router.navigate(['/']); // về homepage
          }
        });
      },
      // (tuỳ chọn) this.bookingForm.reset(...)

      error: (err) => {
        console.error('Request-bookings error:', err);
        this.toastr.error(err?.error?.message || 'Gửi yêu cầu thất bại');
        this.submitting = false;
      }
    });
  }


  /** Helper lấy control trong template */
  get f() {
    return this.bookingForm.controls;
  }
}
