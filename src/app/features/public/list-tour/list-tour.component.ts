import { Component, ElementRef, OnInit, QueryList, ViewChildren } from "@angular/core";
import { ListTourService } from "../services/list-tour.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FormatDatePipe } from "../../../shared/pipes/format-date.pipe";
import { CurrencyVndPipe } from "../../../shared/pipes/currency-vnd.pipe";
import { DurationFormatPipe } from "../../../shared/pipes/duration-format.pipe";
import { PaginationComponent } from "../../../shared/components/pagination/pagination.component";
import { IconTransportPipe } from "../../../shared/pipes/icon-transport.pipe";
import { SkeletonComponent } from "../../../shared/components/skeleton/skeleton.component";



@Component({
  standalone: true,
  selector: 'app-list-tour',
  templateUrl: './list-tour.component.html',
  styleUrls: ['./list-tour.component.css'],
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
  ]
})

export class ListTourComponent implements OnInit {
  tours: any[] = [];
  total = 0;
  page = 0;
  size = 10;
  sort = 'latest'; // hoặc 'price_asc', 'price_desc'
  isLoading = true;

  filters = {
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    departId: undefined as number | undefined,
    destId: undefined as number | undefined,
    date: undefined as string | undefined,
  };

  departLocations: any[] = [];
  destinations: any[] = [];

  constructor(private tourService: ListTourService) { }

  ngOnInit(): void {
    this.loadFiltersData();
    this.fetchFilteredTours();
  }

  fetchFilteredTours(): void {
    this.isLoading = true;
    this.tourService.getFilteredTours({
      ...this.filters,
      page: this.page,
      size: this.size,
      sortField: this.getSortField(),      // → ví dụ: "startingPrice"
      sortDirection: this.getSortDirection()
    }).subscribe({
      next: (res) => {
        console.log(res)
        this.tours = res.data.items;
        this.total = res.data.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy tour:', err);
        this.isLoading = false;
      }
    });
  }

  loadFiltersData(): void {
    // this.tourService.getDepartLocations().subscribe({
    //   next: (res) => (this.departLocations = res.data),
    //   error: (err) => console.error('Lỗi load điểm đi:', err)
    // });

    // this.tourService.getDestinations().subscribe({
    //   next: (res) => (this.destinations = res.data),
    //   error: (err) => console.error('Lỗi load điểm đến:', err)
    // });
  }
  get selectedPriceLabel(): string {
    switch (this.selectedPriceRangeKey) {
      case 'under5': return 'Dưới 5 triệu';
      case '5to10': return '5 - 10 triệu';
      case '10to20': return '10 - 20 triệu';
      case 'above20': return 'Trên 20 triệu';
      default: return '';
    }
  }
  clearPriceFilter(): void {
    this.filters.priceMin = undefined;
    this.filters.priceMax = undefined;
    this.selectedPriceRangeKey = null;

    this.page = 0;
    this.fetchFilteredTours();
  }

  applyFilters(): void {
    this.page = 0;
    this.fetchFilteredTours();
  }
  getSortField(): string {
    if (this.sort === 'price_asc' || this.sort === 'price_desc') return 'startingPrice';
    return 'createdAt';
  }

  getSortDirection(): string {
    if (this.sort === 'price_asc') return 'asc';
    return 'desc';
  }

  onSortChange(value: string): void {
    this.sort = value;
    this.fetchFilteredTours();
  }
  onPageChange(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages) return;
    this.page = newPage;
    this.fetchFilteredTours();
  }

  get totalPages(): number {
    console.log('Total items:', this.total, 'Page size:', this.size);
    return Math.ceil(this.total / this.size);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
  selectedPriceRangeKey: string | null = null;

  setPriceRange(min: number, max: number | undefined, key: string): void {
    this.filters.priceMin = min;
    this.filters.priceMax = max;
    this.selectedPriceRangeKey = key;

    this.page = 0; // Reset về trang đầu
    this.fetchFilteredTours();
  }


  @ViewChildren('scrollRef') scrollContainers!: QueryList<ElementRef>;

  // Scroll trái
  scrollLeft(tourId: number): void {
    const target = this.getScrollContainerByTourId(tourId);
    if (target) {
      target.scrollBy({ left: -100, behavior: 'smooth' });
    }
  }

  // Scroll phải
  scrollRight(tourId: number): void {
    const target = this.getScrollContainerByTourId(tourId);
    if (target) {
      target.scrollBy({ left: 100, behavior: 'smooth' });
    }
  }
  // Tìm scroll container ứng với tour id
  private getScrollContainerByTourId(tourId: number): HTMLElement | null {
    const containers = this.scrollContainers.toArray();
    for (let c of containers) {
      const el = c.nativeElement as HTMLElement;
      if (el.dataset['tourId'] === tourId.toString()) {
        return el;
      }
    }
    return null;
  }

  addToWishlist(tourId: number): void {
    // const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    // if (!wishlist.includes(tourId)) {
    //   wishlist.push(tourId);
    //   localStorage.setItem('wishlist', JSON.stringify(wishlist));
    //   alert('Đã thêm vào danh sách yêu thích!');
    // }
  }

}




interface TourItem {
  id: number;
  name: string;
  thumbnailUrl: string;
  averageRating: number;
  durationDays: number;
  region: string;
  locationName: string;
  startingPrice: number;
  departureDate: string[];
}

interface TourListResponse {
  page: number;
  size: number;
  total: number;
  items: TourItem[];
}
