import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { DurationFormatPipe } from '../../../shared/pipes/duration-format.pipe';
import { FormsModule } from '@angular/forms';
import { ListTourService } from '../services/list-tour.service';

interface Tour {
  id: number;
  name: string;
  thumbnailUrl: string;
  averageRating: number;
  durationDays: number;
  region: string;
  locationName: string;
  startingPrice: number;
}

interface ApiResponse {
  status: number;
  code: number;
  message: string;
  data: {
    page: number;
    size: number;
    total: number;
    items: Tour[];
  };
}

@Component({
  selector: 'app-list-tour',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DurationFormatPipe,
  ],
  templateUrl: './list-tour.component.html',
})
export class ListTourComponent implements OnInit {
  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  page = 0;
  size = 10;
  total = 0;

  selectedDate = 'all';
  selectedPrice = 'all';
  selectedTransport = 'all';
  selectedRecent = 'all';

  constructor(
    private listTourService: ListTourService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTours();
    }
  }

  loadTours(): void {
    this.isLoading = true;
    this.listTourService.getTourList(this.page, this.size).subscribe({
      next: (response: ApiResponse) => {
        if (response.status === 0 && response.code === 0) {
          const data = response.data || { items: [], page: 0, size: 10, total: 0 };
          this.tours = data.items;
          this.filteredTours = [...this.tours];
          this.page = data.page;
          this.size = data.size;
          this.total = data.total;
        } else {
          this.errorMessage = response.message || 'Lỗi khi tải dữ liệu';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching tour data', err);
        this.errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
        this.isLoading = false;
      },
    });
  }

  filterTours(): void {
    let result = [...this.tours];

    // Lọc theo ngày khởi hành (API không cung cấp departure, tạm thời bỏ qua)
    if (this.selectedDate === 'today') {
      const today = new Date().toLocaleDateString('vi-VN');
      // Thêm logic nếu có trường departure
    } else if (this.selectedDate === 'next7days') {
      const today = new Date();
      // Thêm logic nếu có trường departure
    }

    // Lọc theo giá
    if (this.selectedPrice === 'lowtohigh') {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (this.selectedPrice === 'hightolow') {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    }

    // Lọc theo phương tiện (API không cung cấp transport, tạm thời bỏ qua)
    if (this.selectedTransport !== 'all') {
      // Thêm logic nếu có trường transport
    }

    // Lọc theo ngày gần nhất (API không cung cấp departure, tạm thời bỏ qua)
    if (this.selectedRecent === 'recent') {
      // Thêm logic nếu có trường departure
    }

    this.filteredTours = result;
  }

  applyFilters(): void {
    this.page = 0; // Reset về trang đầu khi áp dụng bộ lọc
    this.loadTours(); // Gọi lại API với bộ lọc (cần điều chỉnh API để hỗ trợ)
    this.filterTours();
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadTours();
    }
  }

  nextPage(): void {
    if ((this.page + 1) * this.size < this.total) {
      this.page++;
      this.loadTours();
    }
  }

  get totalPages(): number {
    return this.total > 0 ? Math.ceil(this.total / this.size) : 1;
  }
}