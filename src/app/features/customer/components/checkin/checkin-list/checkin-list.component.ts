// change: import bổ sung
import { ChangeDetectionStrategy, Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable, take } from 'rxjs';

import { CheckinService, CheckinBooking, Page } from '../../../services/checkin.service';
import { CurrentUserService } from '../../../../../core/services/user-storage/current-user.service';
import { CurrencyVndPipe } from '../../../../../shared/pipes/currency-vnd.pipe';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../../../core/models/api-response.model';

@Component({
  selector: 'app-checkin-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, CurrencyVndPipe, PaginationComponent, FormsModule], // change
  templateUrl: './checkin-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // change
})
export class CheckinListComponent implements OnInit {
  // ---- signals (UI state)
  loading    = signal(true);   // change
  errorMsg   = signal<string | null>(null); // change

  // ---- data
  all        = signal<CheckinBooking[]>([]); // change: dữ liệu full khi clientMode
  rows       = signal<CheckinBooking[]>([]); // change: dữ liệu trang hiện tại

  // ---- pagination (0-based)
  page       = signal(0);      // change
  size       = signal(9);      // change
  total      = signal(0);      // change

  // ---- filters
  name       = signal<string>('');        // change
  departDate = signal<string>('');        // yyyy-MM-dd  // change

  // ---- mode
  clientMode  = signal(false); // true khi có filter  // change
  fetchingAll = signal(false); // đang gom tất cả trang // change

  // ---- user
  userId = signal<number | null>(null);   // change

  constructor(
    private checkinService: CheckinService,
    private currentUser: CurrentUserService,
    private toastr: ToastrService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object, // change
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // change
    this.currentUser.currentUser$.pipe(take(1)).subscribe(u => {
      this.userId.set(u?.id ?? null);
      if (!this.userId()) {
        this.errorMsg.set('Không xác định được người dùng. Vui lòng đăng nhập lại.');
        this.loading.set(false);
        return;
      }
      this.fetch(); // change
    });
  }

  // ===== fetch (hybrid giống RequestBooking)
  private hasClientFilters(): boolean { // change
    return !!(this.name().trim() || this.departDate());
  }

  fetch(): void { // change
    if (!this.userId()) { this.loading.set(false); return; }

    this.clientMode.set(this.hasClientFilters());

    // có filter -> gom tất cả trang rồi lọc client
    if (this.clientMode()) {
      this.page.set(0); // về trang đầu khi áp filter
      this.fetchAllForFilters();
      return;
    }

    // không filter -> phân trang server
    this.loading.set(true);
    this.errorMsg.set(null);

    this.checkinService.getCheckinBookings(this.userId()!, { page: this.page(), size: this.size() }).subscribe({
      next: (res: ApiResponse<any>) => {
        const data = res?.data || { items: [], total: 0 };
        // chấp nhận cả 2 kiểu trả (Page hoặc mảng phẳng)
        if (Array.isArray(data.items)) {
          this.rows.set((data.items as CheckinBooking[]) || []);
          this.total.set(Number(data.total) || 0);
        } else if (Array.isArray(res?.data)) {
          const arr = res.data as CheckinBooking[];
          this.rows.set(arr.slice(0, this.size()));
          this.total.set(arr.length);
        } else {
          this.rows.set([]);
          this.total.set(0);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('checkin list error', err);
        this.errorMsg.set(err?.status ? `Lỗi ${err.status}` : 'Không kết nối được máy chủ');
        this.loading.set(false);
      }
    });
  }

  private fetchAllForFilters(): void { // change
    if (!this.userId()) return;

    this.fetchingAll.set(true);
    this.loading.set(true);
    this.errorMsg.set(null);

    // gọi trang 0 để biết tổng
    this.checkinService.getCheckinBookings(this.userId()!, { page: 0, size: this.size() }).subscribe({
      next: (res: any) => {
        const d = res?.data || { items: [], total: 0, size: this.size(), page: 0 };
        const first = d.items || (Array.isArray(d) ? d : []);
        const total = d.total ?? first.length;
        const pageSize = d.size ?? this.size();
        const totalPages = Math.max(Math.ceil(total / pageSize), 1);

        const normalize = (arr: any[]): CheckinBooking[] => arr as CheckinBooking[];

        if (totalPages === 1) {
          this.all.set(normalize(first));
          this.applyFilters();
          this.fetchingAll.set(false);
          this.loading.set(false);
          return;
        }

        const calls: Observable<any>[] = [];
        for (let p = 1; p < totalPages; p++) {
          calls.push(this.checkinService.getCheckinBookings(this.userId()!, { page: p, size: pageSize }));
        }

        forkJoin(calls).subscribe({
          next: (rest) => {
            const all = normalize(first).concat(...rest.map(r => normalize(r?.data?.items || (Array.isArray(r?.data) ? r.data : []))));
            this.all.set(all);
            this.applyFilters();
            this.fetchingAll.set(false);
            this.loading.set(false);
          },
          error: () => {
            this.errorMsg.set('Không thể tải đủ dữ liệu để lọc.');
            this.fetchingAll.set(false);
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.errorMsg.set('Không tải được danh sách check-in.');
        this.fetchingAll.set(false);
        this.loading.set(false);
      }
    });
  }

  // ===== client filter + paginate (giống RequestBooking)
  private filterClient(list: CheckinBooking[]): CheckinBooking[] { // change
    const q = this.name().trim().toLowerCase();
    const d = this.departDate();

    return list.filter(i => {
      const okName = q ? (i.tourName || '').toLowerCase().includes(q) : true;
      const okDate = d ? (i.departureDate || '').slice(0, 10) === d : true;
      return okName && okDate;
    });
  }

  applyFilters(): void { // change
    const filtered = this.filterClient(this.all());
    // có thể sort theo createdAt/ departureDate nếu muốn
    this.total.set(filtered.length);
    const start = this.page() * this.size();
    this.rows.set(filtered.slice(start, start + this.size()));

    // clamp page nếu overflow
    const maxPage = Math.max(Math.ceil(this.total() / this.size()) - 1, 0);
    if (this.page() > maxPage) {
      this.page.set(0);
      this.rows.set(filtered.slice(0, this.size()));
    }
  }

  resetFilters(): void { // change
    this.name.set('');
    this.departDate.set('');
    this.page.set(0);
    this.fetch();
  }

  onPageChange(p: number): void { // change
    this.page.set(p);
    if (this.clientMode()) this.applyFilters();
    else this.fetch();
  }

  openPhotos(b: CheckinBooking) {
    this.router.navigate(['/customer/checkin', b.id]);
  }
}
