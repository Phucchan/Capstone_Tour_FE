// src/app/features/business/pages/request-booking-detail/request-booking-detail.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { RequestBookingService } from '../../services/request-booking.service';
import {
  RequestBookingDetail,
  RequestBookingStatus,
} from '../../models/request-booking.model';

@Component({
  selector: 'app-request-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './request-booking-detail.component.html',
})
export class RequestBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestBookingService = inject(RequestBookingService);

  public request$!: Observable<RequestBookingDetail>;
  public RequestBookingStatus = RequestBookingStatus; // Expose enum to template

  ngOnInit(): void {
    this.request$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          return this.requestBookingService.getRequestDetail(+id);
        }
        // If no ID, redirect to list
        this.router.navigate(['/business/request-bookings']);
        return EMPTY;
      })
    );
  }

  updateStatus(id: number, status: 'ACCEPTED' | 'REJECTED'): void {
    const action = status === 'ACCEPTED' ? 'chấp nhận' : 'từ chối';
    if (confirm(`Bạn có chắc chắn muốn ${action} yêu cầu này không?`)) {
      this.requestBookingService.updateRequestStatus(id, status).subscribe({
        next: () => {
          alert(`Đã ${action} yêu cầu thành công.`);
          // Refresh the view by re-fetching data
          this.request$ = this.requestBookingService.getRequestDetail(id);
        },
        error: (err) => {
          console.error(`Lỗi khi ${action} yêu cầu:`, err);
          alert(`Có lỗi xảy ra khi ${action} yêu cầu.`);
        },
      });
    }
  }

  createTour(id: number): void {
    if (confirm('Bạn có muốn tạo một tour mới từ yêu cầu này không?')) {
      this.requestBookingService.createTourFromRequest(id).subscribe({
        next: (createdTour) => {
          alert(
            'Đã tạo tour brouillon thành công! Bạn sẽ được chuyển đến trang chỉnh sửa tour.'
          );
          this.router.navigate(['/business/tour-form', createdTour.id]);
        },
        error: (err) => {
          console.error('Lỗi khi tạo tour từ yêu cầu:', err);
          alert('Có lỗi xảy ra trong quá trình tạo tour.');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/business/request-bookings']);
  }

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
