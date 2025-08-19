

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

  constructor(private http: HttpClient, private listTourService: ListTourService) { }

  ngOnInit(): void {
    if (!this.loadedOnce) {
      this.loadedOnce = true;
      this.loadDiscountTours();
    }
  }

  loadDiscountTours(): void {
    this.listTourService.getDiscountTours(this.page, this.size, this.sort).subscribe({
      next: (res) => {
        this.tours = res.data.items;
        this.total = res.data.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadDiscountTours();
  }

  getDiscountedPrice(original: number, percent: number): number {
    return Math.floor(original * (1 - percent / 100));
  }

  // Khi đổi sort ở dropdown
  onSortChange(value: string): void {
    this.sort = value;
    this.page = 0; // Reset về trang đầu
    this.applySortToTours();
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

