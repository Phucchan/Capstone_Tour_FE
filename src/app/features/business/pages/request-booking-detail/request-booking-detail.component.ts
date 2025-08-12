// src/app/features/business/pages/request-booking-detail/request-booking-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RequestBookingService } from '../../services/request-booking.service';
import {
  RequestBookingDetail,
  RequestBookingStatus,
} from '../../models/request-booking.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { IconTransportPipe } from '../../../../shared/pipes/icon-transport.pipe';
import { EMPTY, Observable, Subject } from 'rxjs';
import { switchMap, catchError, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'app-request-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    IconTransportPipe,
    DatePipe,
    CurrencyPipe,
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <ng-container *ngIf="request$ | async as request; else loading">
        <div class="md:flex md:items-center md:justify-between">
          <div class="min-w-0 flex-1">
            <h2
              class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
            >
              Chi tiết Yêu cầu #{{ request.id }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              Khách hàng:
              <span class="font-medium text-gray-700">{{
                request.customerName
              }}</span>
            </p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <div
              *ngIf="request.status === RequestBookingStatus.PENDING"
              class="flex space-x-3"
            >
              <button
                (click)="updateStatus(request.id, 'REJECTED')"
                type="button"
                class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Từ chối
              </button>
              <button
                (click)="updateStatus(request.id, 'ACCEPTED')"
                type="button"
                class="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Chấp nhận
              </button>
            </div>
            <button
              *ngIf="request.status === RequestBookingStatus.ACCEPTED"
              (click)="createCustomTour(request.id)"
              type="button"
              class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Tạo Tour theo Yêu cầu
            </button>
          </div>
        </div>
        <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl class="sm:divide-y sm:divide-gray-200">
              <!-- Render details here -->
              <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt class="text-sm font-medium text-gray-500">
                  Thông tin liên hệ
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {{ request.customerName }} <br />
                  {{ request.customerEmail }} <br />
                  {{ request.customerPhone }}
                </dd>
              </div>
              <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt class="text-sm font-medium text-gray-500">Thời gian</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {{ request.startDate | date : 'dd/MM/yyyy' }} -
                  {{ request.endDate | date : 'dd/MM/yyyy' }}
                </dd>
              </div>
              <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt class="text-sm font-medium text-gray-500">
                  Số lượng khách
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {{ request.adults }} người lớn, {{ request.children }} trẻ em,
                  {{ request.infants }} trẻ sơ sinh
                </dd>
              </div>
              <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt class="text-sm font-medium text-gray-500">Ngân sách</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {{ request.priceMin | currency : 'VND' }} -
                  {{ request.priceMax | currency : 'VND' }}
                </dd>
              </div>
              <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt class="text-sm font-medium text-gray-500">
                  Mô tả chi tiết
                </dt>
                <dd
                  class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap"
                >
                  {{ request.desiredServices }}
                </dd>
              </div>
              <div
                *ngIf="request.reason"
                class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5 bg-red-50"
              >
                <dt class="text-sm font-medium text-red-700">Lý do từ chối</dt>
                <dd
                  class="mt-1 text-sm text-red-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap"
                >
                  {{ request.reason }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </ng-container>
      <ng-template #loading><app-spinner></app-spinner></ng-template>
    </div>
  `,
})
export class RequestBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestBookingService = inject(RequestBookingService);

  public request$!: Observable<RequestBookingDetail>;
  private refreshTrigger$ = new Subject<void>();

  public RequestBookingStatus = RequestBookingStatus;

  ngOnInit(): void {
    const id$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) return [+id];
        this.router.navigate(['/business/request-bookings']);
        return EMPTY;
      })
    );

    this.request$ = this.refreshTrigger$.pipe(
      startWith(undefined),
      switchMap(() => id$),
      switchMap((id) => this.requestBookingService.getRequestDetail(id)),
      catchError(() => {
        this.router.navigate(['/404']);
        return EMPTY;
      })
    );
  }

  updateStatus(id: number, status: 'ACCEPTED' | 'REJECTED'): void {
    const action = status === 'ACCEPTED' ? 'chấp nhận' : 'từ chối';

    let reason = '';
    if (status === 'REJECTED') {
      reason = prompt('Vui lòng nhập lý do từ chối:') || '';
      if (!reason.trim()) {
        alert('Lý do từ chối không được để trống.');
        return;
      }
    }

    if (confirm(`Bạn có chắc chắn muốn ${action} yêu cầu này không?`)) {
      const apiCall =
        status === 'REJECTED'
          ? this.requestBookingService.rejectRequest(id, reason)
          : this.requestBookingService.updateRequestStatus(id, status);

      apiCall.subscribe({
        next: () => {
          alert(`Đã ${action} yêu cầu thành công.`);
          this.refreshTrigger$.next();
        },
        error: (err) =>
          alert(`Có lỗi xảy ra: ${err.error?.message || 'Không thể cập nhật'}`),
      });
    }
  }

  createCustomTour(id: number): void {
    this.router.navigate(['/business/tours/new'], {
      queryParams: { requestBookingId: id, tourType: 'CUSTOM' },
    });
  }
}
