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
    FormatDatePipe,
    CurrencyVndPipe,
    DurationFormatPipe,
    PaginationComponent,
    IconTransportPipe,
  ]
})

export class ListTourComponent implements OnInit {
  tours: any[] = [];
  total = 0;
  page = 0;
  size = 10;
  sort = 'latest'; // hoặc 'price_asc', 'price_desc'
  isLoading = true;

  constructor(private tourService: ListTourService) { }

  ngOnInit(): void {
    this.fetchTours();
  }

  fetchTours(): void {
    this.isLoading = true;
    this.tourService.getTours({ page: this.page, size: this.size, sort: this.sort }).subscribe({
      next: (response: any) => {
        this.tours = response.data.items;
        console.log('Tours fetched:', response);
        this.total = response.data.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching tours:', error);
        this.isLoading = false;
      }
    });
  }

  onSortChange(value: string): void {
    this.sort = value;
    this.fetchTours();
  }
  onPageChange(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages) return;
    this.page = newPage;
    this.fetchTours();
  }

  get totalPages(): number {
    console.log('Total items:', this.total, 'Page size:', this.size);
    return Math.ceil(this.total / this.size);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
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
  console.log('Đã thêm tour vào wishlist:', tourId);
  // TODO: Thêm xử lý thực tế ở đây (gọi service, lưu localStorage, hiển thị thông báo,...)
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
  departureDate: string [];
}

interface TourListResponse {
  page: number;
  size: number;
  total: number;
  items: TourItem[];
}
