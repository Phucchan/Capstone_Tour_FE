// src/app/features/business/pages/request-booking-list/request-booking-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';

import { RequestBookingService } from '../../services/request-booking.service';
import {
  RequestBookingNotification,
  RequestBookingPage,
  RequestBookingStatus,
} from '../../models/request-booking.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-request-booking-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, DatePipe],
  templateUrl: './request-booking-list.component.html',
})
export class RequestBookingListComponent implements OnInit {
  private requestBookingService = inject(RequestBookingService);
  private router = inject(Router);

  public requestsPage$!: Observable<RequestBookingPage>;
  private refresh$ = new BehaviorSubject<void>(undefined);

  public currentPage = 0;
  public pageSize = 10;

  ngOnInit(): void {
    this.requestsPage$ = this.refresh$.pipe(
      switchMap(() =>
        this.requestBookingService.getRequests(this.currentPage, this.pageSize)
      )
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.refresh$.next();
  }

  handleCreateTour(request: RequestBookingNotification): void {
    if (
      confirm(
        `Bạn có chắc chắn muốn tạo tour từ yêu cầu của khách hàng "${request.customerName}" không?`
      )
    ) {
      this.requestBookingService.createTourFromRequest(request.id).subscribe({
        next: (createdTour) => {
          alert(
            `Đã tạo tour brouillon thành công! Bạn sẽ được chuyển đến trang chỉnh sửa tour.`
          );
          // Chuyển hướng người dùng đến trang chỉnh sửa tour vừa tạo
          this.router.navigate(['/business/tour-form', createdTour.id]);
        },
        error: (err) => {
          console.error('Lỗi khi tạo tour từ yêu cầu:', err);
          alert('Có lỗi xảy ra trong quá trình tạo tour.');
        },
      });
    }
  }

  // Hàm để lấy class màu cho từng status
  getStatusClass(status: RequestBookingStatus): string {
    switch (status) {
      case RequestBookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RequestBookingStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case RequestBookingStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
