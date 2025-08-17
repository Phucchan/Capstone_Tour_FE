import {
  Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren
} from "@angular/core";
import { ListTourService } from "../services/list-tour.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormatDatePipe } from "../../../shared/pipes/format-date.pipe";
import { CurrencyVndPipe } from "../../../shared/pipes/currency-vnd.pipe";
import { DurationFormatPipe } from "../../../shared/pipes/duration-format.pipe";
import { PaginationComponent } from "../../../shared/components/pagination/pagination.component";
import { IconTransportPipe } from "../../../shared/pipes/icon-transport.pipe";
import { SkeletonComponent } from "../../../shared/components/skeleton/skeleton.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { WishlistService } from "../../customer/services/wishlist.service";
import { CurrentUserService } from "../../../core/services/user-storage/current-user.service";
import { NgSelectModule } from "@ng-select/ng-select";



@Component({
  standalone: true,
  selector: "app-list-tour",
  templateUrl: "./list-tour.component.html",
  styleUrls: ["./list-tour.component.css"],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyVndPipe,
    DurationFormatPipe,
    PaginationComponent,
    IconTransportPipe,
    SkeletonComponent,
    NgSelectModule
  ],
})
export class ListTourComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Danh sách tour, tổng số tour, phân trang
  tours: any[] = [];
  total = 0;
  page = 0;
  size = 10;

  // Mặc định sort là 'latest'
  sort = "latest"; // hoặc 'price_asc', 'price_desc'

  isLoading = true;

  // Bộ lọc
  filters = {
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    departId: undefined as number | undefined,
    destId: undefined as number | undefined,
    date: undefined as string | undefined,
    name: undefined as string | undefined
  };

  departLocations: any[] = [];
  destinations: any[] = [];

  // Thông tin điểm đến (nếu có)
  locationInfo: { name: string; description: string } | null = null;

  // Để xác định giá đang lọc theo mức nào
  selectedPriceRangeKey: string | null = null;

  @ViewChildren("scrollRef") scrollContainers!: QueryList<ElementRef>;

  constructor(
    private tourService: ListTourService,
    private route: ActivatedRoute,
    private router: Router,
    private wishlistService: WishlistService,
    private currentUserService: CurrentUserService
  ) { }

  ngOnInit(): void {
    // Lắng nghe thay đổi route param để load đúng tours theo location (destId)
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const paramDestId = +(params.get("destId") ?? 0);
        if (paramDestId) {
          if (this.preventDoubleFetch) {
            this.preventDoubleFetch = false; // change: chỉ cho fetch 1 lần
            return;
          }
          // Nếu khác id cũ mới fetch lại tours
          if (this.filters.destId !== paramDestId) {
            this.filters.destId = paramDestId;
            this.page = 0;
            this.fetchFilteredTours();
          }
        } else {
          // Không có destId, về trang chủ
          this.router.navigate(["/"]);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Lấy tours theo filter hiện tại
  fetchFilteredTours(): void {
    this.isLoading = true;
    const destId = this.filters.destId ?? 0;
    this.tourService
      .getFilteredTours({
        destId,
        priceMin: this.filters.priceMin,
        priceMax: this.filters.priceMax,
        departId: this.filters.departId,
        date: this.filters.date,
        page: this.page,
        size: this.size,
        name: this.filters.name,
        sortField: this.getSortField(),
        sortDirection: this.getSortDirection(),

      })
      .subscribe({
        next: (res) => {
          this.tours = res.data.tours.items;

          // --- Tìm đúng destination theo id để lấy name và description:
          this.destinations = res.data.options.destinations;
          const matched = this.destinations.find((d: any) => Number(d.id) === Number(destId));
          this.locationInfo = matched
            ? { name: matched.name, description: matched.description }
            : null;
          // console.log('>>> locationInfo:', this.locationInfo);
          // console.log('>>> description:', this.locationInfo?.description);

          this.applySortToTours();
          // Log debug nếu muốn
          // console.log("Sort value:", this.sort, this.tours.map(t => t.startingPrice));
          // console.log("Sau khi sort:", this.tours.map(t => t.startingPrice));

          this.total = res.data.tours.total;
          this.departLocations = res.data.options.departures;
          this.destinations = res.data.options.destinations;

          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          // TODO: Xử lý lỗi nếu cần
        },

      });
  }
  applySortToTours(): void {
    if (this.sort === "price_asc") {
      this.tours = [...this.tours].sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (this.sort === "price_desc") {
      this.tours = [...this.tours].sort((a, b) => b.startingPrice - a.startingPrice);
    }
  }

  clearNameFilter(): void {
    this.filters.name = undefined;
    this.page = 0;
    this.fetchFilteredTours(); // gọi API lại để reset danh sách
  }


  // Tìm field sort gửi xuống API
  getSortField(): string {
    if (this.sort === "price_asc" || this.sort === "price_desc") return "startingPrice";
    return "createdAt";
  }

  // Tìm hướng sort gửi xuống API
  getSortDirection(): string {
    if (this.sort === "price_asc") return "asc";
    return "desc";
  }

  // Khi đổi sort ở dropdown
  onSortChange(value: string): void {
    this.sort = value;
    this.applySortToTours();
  }


  // Khi chuyển trang
  onPageChange(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages) return;
    this.page = newPage;
    this.fetchFilteredTours();
  }

  // Tổng số trang
  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }

  // Mảng trang cho UI pagination
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  // Nhãn cho filter ngân sách
  get selectedPriceLabel(): string {
    switch (this.selectedPriceRangeKey) {
      case "under5":
        return "Dưới 5 triệu";
      case "5to10":
        return "5 - 10 triệu";
      case "10to20":
        return "10 - 20 triệu";
      case "above20":
        return "Trên 20 triệu";
      default:
        return "";
    }
  }

  // Xóa lọc ngân sách
  clearPriceFilter(): void {
    this.filters.priceMin = undefined;
    this.filters.priceMax = undefined;
    this.selectedPriceRangeKey = null;
    this.page = 0;
    this.fetchFilteredTours();
  }

  // Đặt lọc ngân sách
  setPriceRange(min: number, max: number | undefined, key: string): void {
    this.filters.priceMin = min;
    this.filters.priceMax = max;
    this.selectedPriceRangeKey = key;
    this.page = 0;
    this.fetchFilteredTours();
  }
  preventDoubleFetch = false;

  // Áp dụng bộ lọc (khi bấm nút "Áp dụng")
  applyFilters(): void {
    // Nếu đổi điểm đến, chuyển route
    if (
      this.filters.destId &&
      this.filters.destId !== +(this.route.snapshot.paramMap.get("destId") ?? 0)
    ) {
      this.preventDoubleFetch = true;
      this.router.navigate(["/tours/location", this.filters.destId]);
    } else {
      this.fetchFilteredTours();
    }
  }

  // Scroll ngày khởi hành trái/phải cho từng tour
  scrollLeft(tourId: number): void {
    const target = this.getScrollContainerByTourId(tourId);
    if (target) {
      target.scrollBy({ left: -100, behavior: "smooth" });
    }
  }
  scrollRight(tourId: number): void {
    const target = this.getScrollContainerByTourId(tourId);
    if (target) {
      target.scrollBy({ left: 100, behavior: "smooth" });
    }
  }
  private getScrollContainerByTourId(tourId: number): HTMLElement | null {
    const containers = this.scrollContainers.toArray();
    for (let c of containers) {
      const el = c.nativeElement as HTMLElement;
      if (el.dataset["tourId"] === tourId.toString()) {
        return el;
      }
    }
    return null;
  }

  // Thêm vào wishlist
  addToWishlist(tourId: number): void {
    const user = this.currentUserService.getCurrentUser(); // hoặc từ localStorage
    const userId = user?.id;

    if (!userId) {
      alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích.');
      return;
    }

    this.wishlistService.addToWishlist(userId, tourId).subscribe({
      next: () => {
        alert('✅ Đã thêm vào danh sách yêu thích!');
      },
      error: () => {
        alert('❌ Có lỗi khi thêm vào wishlist!');
      }
    });
  }
}
