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
import { forkJoin, Observable } from 'rxjs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { RequestBookingService } from '../../services/request-booking.service';


type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

type RequestItem = {
  id: number;
  tourTheme: string;
  startDate: string;  // yyyy-MM-dd
  endDate: string;    // yyyy-MM-dd
  reason: string;
  status: RequestStatus;
  createdAt: string;  // ISO
};

type ApiPageResp = {
  data?: {
    items?: any[];
    total?: number;
    size?: number;
    page?: number;
  };
};

@Component({
  selector: 'app-request-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DatePipe, PaginationComponent],
  templateUrl: './request-booking-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestBookingListComponent implements OnInit {
  // ui
  loading = signal(true);
  errorMsg = signal<string | null>(null);

  // data
  all = signal<RequestItem[]>([]);
  rows = signal<RequestItem[]>([]);
  page = signal(0);
  size = signal(10);
  total = signal(0);

  // filters (giống booking-histories)
  statuses: { value: RequestStatus; label: string }[] = [
    { value: 'PENDING',   label: 'Đang chờ' },
    { value: 'ACCEPTED',  label: 'Đã chấp nhận' },
    { value: 'REJECTED',  label: 'Đã từ chối' },
    { value: 'COMPLETED', label: 'Đã hoàn thành' },
  ];
  selectedStatus = signal<string>('');   // '' = tất cả
  searchText     = signal<string>('');   // tìm theo tourTheme/reason
  searchDate     = signal<string>('');   // yyyy-MM-dd (lọc theo startDate)

  // mode
  clientMode   = signal(false);  // có filter → true
  fetchingAll  = signal(false);

  // user
  private currentUser = inject(CurrentUserService);
  userId = signal<number | null>(null);

  constructor(
    private requestBookingService: RequestBookingService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.currentUser.currentUser$.pipe(take(1)).subscribe(u => {
      this.userId.set(u?.id ?? null);

      if (!this.userId()) {
        this.errorMsg.set('Không xác định được người dùng. Vui lòng đăng nhập lại.');
        this.loading.set(false);
        return;
      }

      this.fetch();
    });
  }

  // ===== helpers
  statusLabel(v: RequestStatus): string {
    return this.statuses.find(s => s.value === v)?.label || v;
  }

  statusColor(s: RequestStatus) {
    switch (s) {
      case 'PENDING':   return 'bg-amber-100 text-amber-700';
      case 'ACCEPTED':  return 'bg-blue-100 text-blue-700';
      case 'REJECTED':  return 'bg-red-100 text-red-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default:          return 'bg-gray-100 text-gray-700';
    }
  }

  private sortByCreatedDesc(items: RequestItem[]) {
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // ===== mode
  private hasClientFilters(): boolean {
    return !!(this.selectedStatus() || this.searchText().trim() || this.searchDate());
  }

  // ===== fetch (hybrid)
  fetch() {
    if (!this.userId()) { this.loading.set(false); return; }

    this.clientMode.set(this.hasClientFilters());

    if (this.clientMode()) {
      // gom tất cả trang rồi lọc
      this.page.set(0);
      this.fetchAllForFilters();
      return;
    }

    // server mode: không filter → dùng phân trang của BE
    this.loading.set(true);
    this.errorMsg.set(null);

    this.requestBookingService.getCustomerRequestBookings(
      this.userId()!, { page: this.page(), size: this.size() }
    ).subscribe({
      next: (res: any) => {
        const data = res?.data || { items: [], total: 0 };
        const items = (data.items || []) as any[];
        const normalized: RequestItem[] = items.map(i => ({
          id: i.id,
          tourTheme: i.tourTheme,
          startDate: i.startDate,
          endDate: i.endDate,
          reason: i.reason,
          status: i.status as RequestStatus,
          createdAt: i.createdAt,
        }));
        this.rows.set(normalized);
        this.total.set(data.total || 0);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Không tải được danh sách yêu cầu.');
        this.loading.set(false);
      }
    });
  }

  private fetchAllForFilters() {
    if (!this.userId()) return;

    this.fetchingAll.set(true);
    this.loading.set(true);
    this.errorMsg.set(null);

    // gọi trang đầu để biết total/size/totalPages
    this.requestBookingService.getCustomerRequestBookings(
      this.userId()!, { page: 0, size: this.size() }
    ).subscribe({
      next: (res: any) => {
        const d = res?.data || { items: [], total: 0, size: this.size(), page: 0 };
        const first = d.items || [];
        const total = d.total ?? first.length;
        const pageSize = d.size ?? this.size();
        const totalPages = Math.max(Math.ceil(total / pageSize), 1);

        const normalize = (arr: any[]): RequestItem[] =>
          arr.map(i => ({
            id: i.id,
            tourTheme: i.tourTheme,
            startDate: i.startDate,
            endDate: i.endDate,
            reason: i.reason,
            status: i.status as RequestStatus,
            createdAt: i.createdAt,
          }));

        if (totalPages === 1) {
          this.all.set(normalize(first));
          this.applyFilters();
          this.fetchingAll.set(false);
          this.loading.set(false);
          return;
        }

        const calls: Observable<any>[] = [];
        for (let p = 1; p < totalPages; p++) {
          calls.push(
            this.requestBookingService.getCustomerRequestBookings(
              this.userId()!, { page: p, size: pageSize }
            )
          );
        }

        forkJoin(calls).subscribe({
          next: (rest) => {
            const all = normalize(first).concat(
              ...rest.map(r => normalize(r?.data?.items || []))
            );
            this.all.set(all);
            this.applyFilters();
            this.fetchingAll.set(false);
            this.loading.set(false);
          },
          error: () => {
            this.errorMsg.set('Không thể tải đầy đủ dữ liệu để lọc.');
            this.fetchingAll.set(false);
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.errorMsg.set('Không tải được danh sách yêu cầu.');
        this.fetchingAll.set(false);
        this.loading.set(false);
      }
    });
  }

  // ===== filter on client
  private filterClient(list: RequestItem[]): RequestItem[] {
    let out = [...list];

    // trạng thái
    if (this.selectedStatus()) {
      out = out.filter(i => i.status === this.selectedStatus());
    }

    // search theo tourTheme / reason
    const q = this.searchText().trim().toLowerCase();
    if (q) {
      out = out.filter(i =>
        (i.tourTheme || '').toLowerCase().includes(q) ||
        (i.reason || '').toLowerCase().includes(q)
      );
    }

    // ngày (so sánh với startDate)
    const d = this.searchDate();
    if (d) {
      out = out.filter(i => (i.startDate || '').slice(0, 10) === d);
    }

    return out;
  }

  applyFilters() {
    const filtered = this.filterClient(this.all());
    const sorted = this.sortByCreatedDesc(filtered);
    this.total.set(sorted.length);

    // cắt trang client-side
    const start = this.page() * this.size();
    const end = start + this.size();
    this.rows.set(sorted.slice(start, end));

    // nếu current page vượt quá max → về 0
    const maxPage = Math.max(Math.ceil(this.total() / this.size()) - 1, 0);
    if (this.page() > maxPage) {
      this.page.set(0);
      this.rows.set(sorted.slice(0, this.size()));
    }
  }

  resetFilters() {
    this.selectedStatus.set('');
    this.searchText.set('');
    this.searchDate.set('');
    this.page.set(0);
    this.fetch();     // để tự chuyển mode phù hợp
  }

  // ===== pagination events
  onPageChange(p: number) {
    this.page.set(p);
    if (this.clientMode()) {
      this.applyFilters();
    } else {
      this.fetch();
    }
  }
}
