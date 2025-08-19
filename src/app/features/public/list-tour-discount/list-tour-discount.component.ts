

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { IconTransportPipe } from '../../../shared/pipes/icon-transport.pipe';
import { ListTourService } from '../services/list-tour.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';                 
import { map, switchMap, catchError } from 'rxjs/operators'; 
import { is } from 'date-fns/locale';

@Component({
  selector: 'app-list-tour-discount',
  standalone: true,
  templateUrl: './list-tour-discount.component.html',
  styleUrls: ['./list-tour-discount.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    CurrencyVndPipe,
    IconTransportPipe,
    PaginationComponent,
    SkeletonComponent,
    FormsModule,
  ],
})
export class ListTourDiscountComponent implements OnInit {
  tours: any[] = [];
  total = 0;
  page = 0;
  size = 12;
  isLoading = true;
  loadedOnce = false;
  sort = "latest"; // hoặc 'price_asc', 'price_desc'
  name = ''; 
  searchMode = false;         // đang ở chế độ lọc client?
  allToursCache: any[] = [];  // toàn bộ data đã tải để lọc
  filteredTours: any[] = [];  // kết quả sau lọc
  serverTotal = 0;            // lưu total từ BE khi không search
  private MAX_FETCH = 2000; 

  constructor(private http: HttpClient, private listTourService: ListTourService) { }

  ngOnInit(): void {
    if (!this.loadedOnce) {
      this.loadedOnce = true;
      this.loadDiscountTours();
    }
  }

  loadDiscountTours(): void {
    this.isLoading = true;
    this.listTourService.getDiscountTours(this.page, this.size, this.sort).subscribe({
      next: (res) => {
        this.tours = res.data.items;
        this.total = res.data.total;
        this.serverTotal = res.data.total; // change
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    if (this.searchMode) {
      this.updateClientPage(); // change
    } else {
      this.loadDiscountTours();
    }
  }

  getDiscountedPrice(original: number, percent: number): number {
    return Math.floor(original * (1 - percent / 100));
  }

  // Khi đổi sort ở dropdown
  onSortChange(value: string): void {
    this.sort = value;
    this.page = 0; // Reset về trang đầu
   if (this.searchMode) {
      // sort trên client cho filteredTours // change
      this.applySortToArray(this.filteredTours);
      this.updateClientPage();
    } else {
      // sort phía server như cũ
      this.loadDiscountTours();
    }
  }
//helper
   // ======= Client-side search flow ======= //
  onSearchClient(): void {                              // change
    const q = this.name?.trim();
    if (!q) {
      this.onClearSearch();
      return;
    }
    this.searchMode = true;
    this.page = 0;
    this.isLoading = true;

    // 1) Nếu chưa có cache đủ dữ liệu → tải tất cả từ BE (paginate)
    //    Sau đó 2) lọc theo tên, 3) sort, 4) cắt trang hiện tại.
    this.fetchAllToursOnce().subscribe({
      next: (all) => {
        this.allToursCache = all;
        this.applySearchFilter();   // filter theo name
        this.applySortToArray(this.filteredTours); // sort trên client
        this.updateClientPage();    // cắt trang vào this.tours
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onClearSearch(): void {                               // change
    this.searchMode = false;
    this.name = '';
    this.page = 0;
    this.total = this.serverTotal;
    this.loadDiscountTours();
  }

  private fetchAllToursOnce() {                         // change
    // Nếu đã có cache rồi, dùng luôn để search (không gọi lại BE)
    if (this.allToursCache.length > 0) {
      return of(this.allToursCache);
    }

    // Gọi trang 0 để lấy total và items đầu
    return this.listTourService.getDiscountTours(0, this.size, this.sort).pipe(
      switchMap((res0) => {
        const firstItems = res0.data.items as any[];
        const total = res0.data.total as number;

        // Giới hạn tối đa để tránh quá nặng
        const cappedTotal = Math.min(total, this.MAX_FETCH);
        const totalPages = Math.ceil(cappedTotal / this.size);

        // Nếu chỉ 1 trang thì xong
        if (totalPages <= 1) {
          return of(firstItems);
        }

        // Tạo danh sách request cho các trang còn lại: 1..totalPages-1
        const requests = [];
        for (let p = 1; p < totalPages; p++) {
          requests.push(
            this.listTourService.getDiscountTours(p, this.size, this.sort).pipe(
              map(res => res.data.items as any[]),
              catchError(() => of([])) // phòng lỗi lẻ
            )
          );
        }

        return forkJoin(requests).pipe(
          map(restPages => {
            const flat = restPages.flat();
            const all = [...firstItems, ...flat];
            return all;
          })
        );
      })
    );
  }

  private applySearchFilter(): void {                   // change
    const q = this.normalizeText(this.name);
    this.filteredTours = this.allToursCache.filter(t => {
      const name = this.normalizeText(t?.name ?? '');
      return name.includes(q);
    });
    this.total = this.filteredTours.length; // total cho pagination client
  }

  private updateClientPage(): void {                    // change
    const start = this.page * this.size;
    const end = start + this.size;
    this.tours = this.filteredTours.slice(start, end);
  }

  // ======= Sort helpers (client) ======= //
  private applySortToArray(arr: any[]): void {          // change
    if (!arr) return;
    if (this.sort === 'price_asc') {
      arr.sort(
        (a, b) =>
          this.getDiscountedPrice(a.startingPrice, a.discountPercent) -
          this.getDiscountedPrice(b.startingPrice, b.discountPercent)
      );
    } else if (this.sort === 'price_desc') {
      arr.sort(
        (a, b) =>
          this.getDiscountedPrice(b.startingPrice, b.discountPercent) -
          this.getDiscountedPrice(a.startingPrice, a.discountPercent)
      );
    } else if (this.sort === 'latest') {
      arr.sort((a, b) => {
        const dateA = new Date(a.departureDates?.[0]).getTime();
        const dateB = new Date(b.departureDates?.[0]).getTime();
        return dateA - dateB; // ngày sớm hơn lên trước
      });
    } else {
      // '' (Tất cả): không sort thêm
    }
  }

  // ======= Utility: bỏ dấu & lowercase để tìm tiếng Việt mượt ======= //
   normalizeText(str: string): string {          // change
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
      .toLowerCase()
      .trim();
  }
  applySortToTours(): void {
    if (this.sort === "price_asc") {
      this.tours = [...this.tours].sort((a, b) =>
        this.getDiscountedPrice(a.startingPrice, a.discountPercent) - this.getDiscountedPrice(b.startingPrice, b.discountPercent));
    } else if (this.sort === "price_desc") {
      this.tours = [...this.tours].sort((a, b) =>
        this.getDiscountedPrice(b.startingPrice, b.discountPercent) - this.getDiscountedPrice(a.startingPrice, a.discountPercent));
    } else if (this.sort === 'latest') {
      this.tours = [...this.tours].sort((a, b) => {
        const dateA = new Date(a.departureDates[0]).getTime();
        const dateB = new Date(b.departureDates[0]).getTime();
        return dateA - dateB; // ngày sớm hơn lên trước
      });
    }
  }
}

