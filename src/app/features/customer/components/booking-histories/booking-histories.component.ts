import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import Swal from 'sweetalert2';

import { BookingService } from '../../services/booking.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

/** =========================
 *  Kiểu dữ liệu nội bộ (inline)
 *  ========================= */
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
  createdAt: string;      // ISO string
  departureDate: string;  // ISO string
  hasRefundInfo: boolean; // client mặc định nếu BE không có
};

/** =========================
 *  Hằng số danh sách ngân hàng (đưa ra ngoài class để không khởi tạo lại)
 *  ========================= */
const BANKS: ReadonlyArray<{ label: string; value: string }> = [
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
  { label: 'SaigonBank (SGB)', value: 'SaigonBank' },
];

@Component({
  selector: 'app-booking-histories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CurrencyVndPipe, DatePipe, PaginationComponent],
  templateUrl: './booking-histories.component.html',
  styleUrls: ['./booking-histories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingHistoriesComponent implements OnInit {
  /** ===== UI state ===== */
  loading = signal(true);
  loadingResquestCancel = signal(false);
  errorMsg = signal<string | null>(null);

  /** ===== Data state ===== */
  bookings = signal<BookingItem[]>([]);     // dữ liệu đang hiển thị (server mode: trang hiện tại; client mode: đã lọc)
  allBookings = signal<BookingItem[]>([]);  // client mode: toàn bộ items đã gom
  page = signal(0);
  size = signal(10);
  total = signal(0);

  /** ===== Filters ===== */
  selectedStatus = signal<string>('');
  searchCode = signal<string>('');
  searchDate = signal<string>('');
  readonly statuses: BookingStatus[] = [
    'PENDING',
    'CONFIRMED',
    'CANCEL_REQUESTED',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW',
    'REFUNDED',
  ];

  /** ===== Mode chuyển giữa server/client ===== */
  clientMode = signal(false);   // true khi có bất kỳ filter (status/code/date)
  fetchingAll = signal(false);  // trạng thái đang gom nhiều trang từ BE

  /** ===== User ===== */
  private currentUser = inject(CurrentUserService);
  userId = signal<number | null>(null);

  constructor(
    private bookingService: BookingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loading.set(true);
    this.currentUser.currentUser$.pipe(take(1)).subscribe((u: any | null) => {
      this.userId.set(u?.id ?? null);

      if (!this.userId()) {
        this.errorMsg.set('Không xác định được người dùng. Vui lòng đăng nhập lại.');
        this.loading.set(false);
        return;
      }
      this.fetch();
    });
  }

  /** Nhãn tiếng Việt cho status */
  statusLabel(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      CANCEL_REQUESTED: 'Đang yêu cầu hủy',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
      NO_SHOW: 'Không đến',
      REFUNDED: 'Đã hoàn tiền',
    };
    return map[status] || status;
  }

  /** Chuẩn hoá mảng items từ BE về BookingItem[] (dùng chung) */
  private normalize(arr: any[]): BookingItem[] {
    return (arr || []).map((i) => ({
      id: i.id,
      tourId: Number(i.tourId),
      bookingCode: i.bookingCode,
      tourName: i.tourName,
      status: i.status as BookingStatus,
      totalAmount: i.totalAmount,
      createdAt: i.createdAt,
      departureDate: i.departureDate,
      hasRefundInfo: i.hasRefundInfo ?? false,
    }));
  }

  /** Sort theo createdAt desc (mới nhất lên trước) */
  sortByCreatedAtDesc(items: BookingItem[]): BookingItem[] {
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    // Nếu muốn sort theo departureDate: đổi trường ở đây.
  }

  /** Có bất kỳ filter nào không? → kích hoạt client mode */
  hasClientFilters(): boolean {
    return !!(this.selectedStatus() || this.searchCode().trim() || this.searchDate());
  }

  /** ========================
   *  FETCH – gom toàn bộ trang (client mode)
   *  ======================== */
  private fetchAllForFilters() {
    if (!this.userId()) return;
    this.fetchingAll.set(true);
    this.loading.set(true);
    this.errorMsg.set(null);

    // Gọi trang đầu để biết total/size
    this.bookingService
      .getUserBookings({
        page: 0,
        size: this.size(),
        userId: this.userId()!,
        status: this.selectedStatus() || undefined, // vẫn truyền để nếu sau này BE support thì ok
      })
      .subscribe({
        next: (res: ApiPageResp) => {
          const data = res?.data || { items: [], total: 0, size: this.size(), page: 0 };
          const firstItems = data.items || [];
          const total = data.total ?? firstItems.length;
          const pageSize = data.size ?? this.size();
          const totalPages = Math.max(Math.ceil(total / pageSize), 1);

          if (totalPages === 1) {
            this.allBookings.set(this.normalize(firstItems));
            this.applyFilters();
            this.fetchingAll.set(false);
            this.loading.set(false);
            return;
          }

          // Gọi các trang còn lại 1..(totalPages-1)
          const pageCalls: Observable<ApiPageResp>[] = [];
          for (let p = 1; p < totalPages; p++) {
            pageCalls.push(
              this.bookingService.getUserBookings({
                page: p,
                size: pageSize,
                userId: this.userId()!,
                status: this.selectedStatus() || undefined,
              }) as Observable<ApiPageResp>
            );
          }

          forkJoin(pageCalls).subscribe({
            next: (rest: ApiPageResp[]) => {
              const all = this.normalize(firstItems).concat(
                ...rest.map((r) => this.normalize(r?.data?.items || []))
              );
              this.allBookings.set(all);
              this.applyFilters(); // set bookings/total theo client
              this.fetchingAll.set(false);
              this.loading.set(false);
            },
            error: (e) => {
              console.error(e);
              this.errorMsg.set('Không thể tải đầy đủ dữ liệu để lọc.');
              this.fetchingAll.set(false);
              this.loading.set(false);
            },
          });
        },
        error: (e) => {
          console.error(e);
          this.errorMsg.set('Không tải được danh sách đơn.');
          this.fetchingAll.set(false);
          this.loading.set(false);
        },
      });
  }

  /** ========================
   *  FETCH – chế độ server (không filter)
   *  ======================== */
  fetch() {
    if (!this.userId()) {
      this.loading.set(false);
      return;
    }

    this.clientMode.set(this.hasClientFilters());

    // Client mode → gom tất cả rồi lọc local
    if (this.clientMode()) {
      this.page.set(0); // luôn về trang 0 khi đổi filter
      this.fetchAllForFilters();
      return;
    }

    // Server mode → gọi BE theo page/size
    this.loading.set(true);
    this.errorMsg.set(null);

    this.bookingService
      .getUserBookings({
        page: this.page(),
        size: this.size(),
        userId: this.userId()!,
        status: this.selectedStatus() || undefined,
      })
      .subscribe({
        next: (res) => {
          const data = res.data || { items: [], total: 0 };
          this.bookings.set(this.normalize(data.items || []));
          this.total.set(data.total || 0); // total chuẩn từ BE
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMsg.set('Không tải được danh sách đơn.');
          this.loading.set(false);
        },
      });
  }

  /** ========================
   *  Lọc local (client mode)
   *  ======================== */
  private filterBookings(list: BookingItem[]): BookingItem[] {
    let out = [...list];

    // 1) Theo status (nếu chọn)
    if (this.selectedStatus()) {
      out = out.filter((i) => i.status === this.selectedStatus());
    }

    // 2) Theo bookingCode (contains, không phân biệt hoa/thường)
    const code = this.searchCode().trim().toLowerCase();
    if (code) {
      out = out.filter((i) => i.bookingCode?.toLowerCase().includes(code));
    }

    // 3) Theo ngày khởi hành (so sánh theo yyyy-MM-dd để tránh lệch timezone)
    const d = this.searchDate();
    if (d) {
      out = out.filter((i) => {
        if (!i.departureDate) return false;
        const onlyDate =
          typeof i.departureDate === 'string'
            ? i.departureDate.slice(0, 10)
            : new Date(i.departureDate).toISOString().slice(0, 10);
        return onlyDate === d;
      });
    }

    return out;
  }

  applyFilters() {
    const filtered = this.filterBookings(this.allBookings());
    const sorted = this.sortByCreatedAtDesc(filtered);
    this.bookings.set(sorted);
    this.total.set(sorted.length); // client mode: total = số lượng sau lọc

    // nếu trang hiện tại vượt quá giới hạn sau khi lọc → quay về 0
    const maxPage = Math.max(Math.ceil(this.total() / this.size()) - 1, 0);
    if (this.page() > maxPage) this.page.set(0);
  }

  resetFilters() {
    this.selectedStatus.set('');
    this.searchCode.set('');
    this.searchDate.set('');
    this.page.set(0);
    this.fetch(); // quay về server mode
  }

  /** ========================
   *  Pagination handlers
   *  ======================== */
  onPageChange(p: number) {
    this.page.set(p);
    if (!this.clientMode()) this.fetch(); // server mode cần gọi lại API
  }

  nextPage() {
    const maxPage = Math.max(Math.ceil(this.total() / this.size()) - 1, 0);
    if (this.page() < maxPage) {
      this.page.update((v) => v + 1);
      if (!this.clientMode()) this.fetch();
    }
  }

  prevPage() {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      if (!this.clientMode()) this.fetch();
    }
  }

  /** ========================
   *  Actions
   *  ======================== */
  canRequestCancel(s: BookingStatus) {
    return s === 'PENDING' || s === 'CONFIRMED';
  }

  // Tùy rule thực tế của BE: cho phép gửi thông tin hoàn sau khi CANCELLED/REFUNDED/CANCEL_REQUESTED
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
        cancelButton: 'swal-cancel-btn',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'Đang gửi yêu cầu...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      this.bookingService.requestCancel(b.id, this.userId()!).subscribe({
        next: () => {
          this.fetch(); // refresh danh sách
          Swal.fire({
            icon: 'success',
            title: 'Yêu cầu hủy đã gửi',
            text: `Đơn ${b.bookingCode} đã chuyển sang trạng thái "Đang yêu cầu hủy".`,
            timer: 1800,
            showConfirmButton: false,
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Gửi yêu cầu thất bại',
            text: 'Vui lòng thử lại sau',
          });
        },
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
        showConfirmButton: false,
      });
      return;
    }

    const bankOptions = BANKS.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join('');

    Swal.fire({
      title: 'Nhập thông tin tài khoản',
      html: `
        <div class="text-left space-y-3">
        <p class="text-sm text-red-400">Vui lòng nhập đúng thông tin tài khoản, trường hợp sai sót vui lòng liên hệ lại với chúng tôi</p>
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
        cancelButton: 'swal-cancel-btn',
      },
      preConfirm: () => {
        const bankAccountNumber =
          (document.getElementById('bankAccountNumber') as HTMLInputElement)?.value?.trim() || '';
        const bankAccountHolder =
          (document.getElementById('bankAccountHolder') as HTMLInputElement)?.value?.trim() || '';
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
      },
    }).then((result) => {
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
        didOpen: () => Swal.showLoading(),
      });

      this.bookingService.submitRefundInfo(b.id, this.userId()!, payload).subscribe({
        next: () => {
          // Đánh dấu đã gửi STK ngay trên client
          this.bookings.update((list) =>
            list.map((x) => (x.id === b.id ? { ...x, hasRefundInfo: true } : x))
          );

          Swal.fire({
            icon: 'success',
            title: 'Đã gửi thông tin',
            text: `Thông tin hoàn tiền cho đơn ${b.bookingCode} đã được gửi.`,
            timer: 1800,
            showConfirmButton: false,
          });
        },
        error: (e) => {
          console.error(e);
          Swal.fire({
            icon: 'error',
            title: 'Gửi thất bại',
            text: 'Vui lòng thử lại sau.',
          });
        },
      });
    });
  }

  /** ===== UI helpers ===== */
  statusColor(s: BookingStatus) {
    switch (s) {
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

/** Kiểu response trang hoá cơ bản từ BE (đủ dùng cho fetchAllForFilters) */
type ApiPageResp = {
  data?: {
    items?: any[];
    total?: number;
    size?: number;
    page?: number;
  };
};
