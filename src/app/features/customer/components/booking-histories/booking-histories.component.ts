import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { BookingService } from '../../services/booking.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

// ===== Inline types (không tạo model riêng) =====
type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'REFUNDED';

type BookingItem = {
  id: number;
  tourId: number;
  bookingCode: string;
  tourName: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string; // ISO string
  hasRefundInfo: boolean;
};

@Component({
  selector: 'app-booking-histories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyVndPipe,
    DatePipe,
    PaginationComponent
  ],
  templateUrl: './booking-histories.component.html',
  styleUrls: ['./booking-histories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingHistoriesComponent implements OnInit {
  // ===== UI state =====
  loading = signal(true);
  loadingResquestCancel = signal(false);
  errorMsg = signal<string | null>(null);

  // ===== Data state =====
  bookings = signal<BookingItem[]>([]);
  page = signal(0);
  size = signal(10);
  total = signal(0);

  // ===== Filters =====
  readonly statuses: BookingStatus[] = [
    'PENDING',
    'CONFIRMED',
    'CANCEL_REQUESTED',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW',
    'REFUNDED',
  ];

  statusLabel(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      CANCEL_REQUESTED: 'Đang yêu cầu hủy',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
      NO_SHOW: 'Không đến',
      REFUNDED: 'Đã hoàn tiền'
    };
    return map[status] || status;
  }
  selectedStatus = signal<string>('');

  // ===== User =====
  private currentUser = inject(CurrentUserService);
  userId = signal<number | null>(null);

  constructor(
    private bookingService: BookingService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loading.set(true);

    // Lấy user hiện tại một lần rồi fetch
    this.currentUser.currentUser$
      .pipe(take(1))
      .subscribe((u: any | null) => {
        this.userId.set(u?.id ?? null);

        if (!this.userId()) {
          this.errorMsg.set(
            'Không xác định được người dùng. Vui lòng đăng nhập lại.',
          );
          this.loading.set(false);
          return;
        }

        this.fetch();
      });
  }

  sortByCreatedAtDesc(items: BookingItem[]): BookingItem[] {
    return [...items].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  onPageChange(p: number) {   // p là 0-based do PaginationComponent phát ra
    this.page.set(p);
    this.fetch();
  }

  // ===== API =====
  fetch() {
    if (!this.userId()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    this.bookingService
      .getUserBookings({
        page: this.page(),
        size: this.size(),
        userId: this.userId()!, // đã guard ở trên
        status: this.selectedStatus() || undefined,
      })
      .subscribe({
        next: (res) => {
          const data = res.data || { items: [], total: 0 };
          const items = (data.items || []) as BookingItem[];

          const normalized: BookingItem[] = items.map((i: any) => ({
        id: i.id,
        tourId: Number(i.tourId),                               // 👈 giữ chắc tourId
        bookingCode: i.bookingCode,
        tourName: i.tourName,
        status: i.status as BookingStatus,
        totalAmount: i.totalAmount,
        createdAt: i.createdAt,
        hasRefundInfo: i.hasRefundInfo ?? false,                // 👈 mặc định client
      }));
          const filtered = this.selectedStatus()
            ? normalized.filter(i => i.status === this.selectedStatus())
            : normalized;

          this.bookings.set(this.sortByCreatedAtDesc(filtered));
          this.total.set(data.total || filtered.length);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMsg.set('Không tải được danh sách đơn.');
          this.loading.set(false);
        },
      });
  }

  // ===== Pagination =====
  nextPage() {
    const maxPage = Math.max(Math.ceil(this.total() / this.size()) - 1, 0);
    if (this.page() < maxPage) {
      this.page.update((v) => v + 1);
      this.fetch();
    }
  }

  prevPage() {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      this.fetch();
    }
  }

  // ===== Actions =====
  canRequestCancel(s: BookingStatus) {
    return s === 'PENDING' || s === 'CONFIRMED';
  }

  // Tùy rule thực tế của BE, có thể chỉ cho phép sau khi CANCELLED
  canSubmitRefund(s: BookingStatus) {
    return s === 'CANCELLED' || s === 'REFUNDED' || s === 'CANCEL_REQUESTED';
  }

  requestCancel(b: BookingItem) {
    if (!this.canRequestCancel(b.status)) return;

    Swal.fire({
      title: 'Xác nhận hủy đơn?',
      html: `
      <div class="text-left">
        <p class="mb-1">Mã đơn: <span class="font-mono font-semibold">${b.bookingCode}</span></p>
        <p>Trạng thái hiện tại: <b>${this.statusLabel(b.status)}</b></p>
        <ul class="mt-3 list-disc pl-5 text-gray-600 text-sm">
          <li>Đơn sẽ chuyển sang <b>Đang yêu cầu hủy</b></li>
          <li>Quá trình xử lý có thể mất vài phút</li>
        </ul>
      </div>
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Gửi yêu cầu',
      cancelButtonText: 'Không',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg shadow-lg',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      },
      buttonsStyling: false // để dùng Tailwind class
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'Đang gửi yêu cầu...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
      });

      this.bookingService.requestCancel(b.id, this.userId()!).subscribe({
        next: () => {
          this.fetch();
          Swal.fire({
            icon: 'success',
            title: 'Yêu cầu hủy đã gửi',
            text: `Đơn ${b.bookingCode} đã chuyển sang trạng thái "Đang yêu cầu hủy".`,
            timer: 1800,
            showConfirmButton: false
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Gửi yêu cầu thất bại',
            text: 'Vui lòng thử lại sau'
          });
        }
      });
    });
  }



  submitRefund(b: BookingItem) {
  if (!this.canSubmitRefund(b.status)) return;

  if (b.hasRefundInfo) {
    Swal.fire({
      icon: 'info',
      title: 'Thông báo',
      text: 'Bạn đã gửi thông tin STK cho đơn này.',
      timer: 1600,
      showConfirmButton: false
    });
    return;
  }

  const BANKS: { label: string; value: string }[] = [
    { label: 'Vietcombank (VCB)', value: 'Vietcombank' },
    { label: 'VietinBank (CTG)', value: 'VietinBank' },
    { label: 'BIDV (BIDV)', value: 'BIDV' },
    { label: 'Agribank (AGR)', value: 'Agribank' },
    { label: 'Techcombank (TCB)', value: 'Techcombank' },
    { label: 'MB Bank (MBB)', value: 'MB Bank' },
    { label: 'VPBank (VPB)', value: 'VPBank' },
    { label: 'ACB', value: 'ACB' },
    { label: 'VIB', value: 'VIB' },
    { label: 'HDBank', value: 'HDBank' },
    { label: 'TPBank', value: 'TPBank' },
    { label: 'Sacombank (STB)', value: 'Sacombank' },
    { label: 'MSB', value: 'MSB' },
    { label: 'SHB', value: 'SHB' },
    { label: 'OCB', value: 'OCB' },
    { label: 'SeABank', value: 'SeABank' },
    { label: 'Eximbank (EIB)', value: 'Eximbank' },
    { label: 'DongA Bank (DAB)', value: 'DongA Bank' },
    { label: 'PVcomBank', value: 'PVcomBank' },
    { label: 'OceanBank', value: 'OceanBank' },
    { label: 'BaoVietBank', value: 'BaoVietBank' },
    { label: 'NCB', value: 'NCB' },
    { label: 'LienVietPostBank (LPB)', value: 'LienVietPostBank' },
    { label: 'ABBANK', value: 'ABBANK' },
    { label: 'PG Bank', value: 'PG Bank' },
    { label: 'KienLongBank', value: 'KienLongBank' },
    { label: 'SaigonBank (SGB)', value: 'SaigonBank' }
  ];

  const bankOptions = BANKS.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');

  Swal.fire({
    title: 'Nhập thông tin tài khoản nhận hoàn',
    html: `
      <div class="text-left space-y-3">
      <div>
          <label class="block text-sm text-gray-600 mb-1">Ngân hàng</label>
          <select id="bankName" class="swal2-select">
            <option value="">-- Chọn ngân hàng --</option>
            ${bankOptions}
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Số tài khoản</label>
          <input id="bankAccountNumber" class="swal2-input" placeholder="Ví dụ: 0123456789" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Chủ tài khoản</label>
          <input id="bankAccountHolder" class="swal2-input" placeholder="Họ và tên trên tài khoản" />
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Gửi',
    cancelButtonText: 'Hủy',
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-lg',
      confirmButton: 'swal-confirm-btn',
      cancelButton: 'swal-cancel-btn'
    },
    preConfirm: () => {
      const bankAccountNumber = (document.getElementById('bankAccountNumber') as HTMLInputElement)?.value?.trim() || '';
      const bankAccountHolder = (document.getElementById('bankAccountHolder') as HTMLInputElement)?.value?.trim() || '';
      const bankName = (document.getElementById('bankName') as HTMLSelectElement)?.value || '';

      if (!bankAccountNumber || !bankAccountHolder || !bankName) {
        Swal.showValidationMessage('Vui lòng nhập đầy đủ thông tin');
        return false as any;
      }
      if (!/^\d{6,20}$/.test(bankAccountNumber)) {
        Swal.showValidationMessage('Số tài khoản không hợp lệ (chỉ số, 6–20 ký tự)');
        return false as any;
      }

      return { bankAccountNumber, bankAccountHolder, bankName };
    }
  }).then(result => {
    if (!result.isConfirmed || !result.value) return;

    const payload = result.value as {
      bankAccountNumber: string;
      bankAccountHolder: string;
      bankName: string;
    };

    Swal.fire({
      title: 'Đang gửi...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading()
    });

    this.bookingService.submitRefundInfo(b.id, this.userId()!, payload).subscribe({
      next: () => {
        // Đánh dấu đã gửi STK ngay trên client
        this.bookings.update(list =>
          list.map(x =>
            x.id === b.id ? { ...x, hasRefundInfo: true } : x
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Đã gửi thông tin',
          text: `Thông tin hoàn tiền cho đơn ${b.bookingCode} đã được gửi.`,
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (e) => {
        console.error(e);
        Swal.fire({
          icon: 'error',
          title: 'Gửi thất bại',
          text: 'Vui lòng thử lại sau.'
        });
      }
    });
  });
}

          // ===== UI helpers =====
          statusColor(s: BookingStatus) {
        switch(s) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
        case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';
        case 'CANCEL_REQUESTED':
        return 'bg-amber-100 text-amber-700';
        case 'CANCELLED':
        return 'bg-red-100 text-red-700';
        case 'COMPLETED':
        return 'bg-green-100 text-green-700';
        case 'NO_SHOW':
        return 'bg-gray-200 text-gray-700';
        case 'REFUNDED':
        return 'bg-purple-100 text-purple-700';
        default:
        return 'bg-gray-100 text-gray-700';
      }
  }

}

  