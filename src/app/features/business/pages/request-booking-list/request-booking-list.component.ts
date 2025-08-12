// src/app/features/business/pages/request-booking-list/request-booking-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { RequestBookingService } from '../../services/request-booking.service';
import {
  RequestBookingPage,
  RequestBookingStatus,
} from '../../models/request-booking.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
@Component({
  selector: 'app-request-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PaginationComponent,
    SpinnerComponent,
    DatePipe,
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">
            Danh sách Yêu cầu Tour Riêng
          </h1>
          <p class="mt-2 text-sm text-gray-700">
            Quản lý các yêu cầu thiết kế tour riêng từ khách hàng.
          </p>
        </div>
      </div>
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
          >
            <div
              class="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <ng-container *ngIf="requestsPage$ | async as page; else loading">
                <table class="min-w-full table-fixed divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Khách hàng
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Điểm đến
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Thời gian
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Trạng thái
                      </th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">Hành động</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr *ngFor="let request of page.items">
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        <div class="font-medium text-gray-900">
                          {{ request.customerName }}
                        </div>
                        <div>{{ request.customerPhone }}</div>
                      </td>
                      <td class="px-3 py-4 text-sm text-gray-500">
                        {{ request.destinations.join(', ') }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{ request.startDate | date : 'dd/MM/yyyy' }} -
                        {{ request.endDate | date : 'dd/MM/yyyy' }}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        <span
                          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          [ngClass]="getStatusClass(request.status)"
                        >
                          {{ getStatusText(request.status) }}
                        </span>
                      </td>
                      <td
                        class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                      >
                        <a
                          [routerLink]="[
                            '/business/request-bookings',
                            request.id
                          ]"
                          class="text-indigo-600 hover:text-indigo-900"
                          >Xem chi tiết</a
                        >
                      </td>
                    </tr>
                    <tr *ngIf="page.items.length === 0">
                      <td
                        colspan="5"
                        class="text-center py-12 text-sm text-gray-500"
                      >
                        Không có yêu cầu nào.
                      </td>
                    </tr>
                  </tbody>
                </table>
                <app-pagination
                  [currentPage]="page.page + 1"
                  [totalItems]="page.total"
                  [pageSize]="pageSize"
                  (pageChange)="onPageChange($event)"
                ></app-pagination>
              </ng-container>
              <ng-template #loading><app-spinner></app-spinner></ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RequestBookingListComponent implements OnInit {
  private requestBookingService = inject(RequestBookingService);
  public requestsPage$!: Observable<RequestBookingPage>;
  private page$ = new BehaviorSubject<number>(1);
  public pageSize = 10;

  ngOnInit(): void {
    this.requestsPage$ = this.page$.pipe(
      switchMap((page) =>
        this.requestBookingService.getRequests(page - 1, this.pageSize)
      )
    );
  }

  onPageChange(page: number): void {
    this.page$.next(page);
  }

  getStatusClass(status: RequestBookingStatus): string {
    const classes = {
      [RequestBookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [RequestBookingStatus.ACCEPTED]: 'bg-green-100 text-green-800',
      [RequestBookingStatus.REJECTED]: 'bg-red-100 text-red-800',
      [RequestBookingStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      PENDING: 'Chờ xử lý',
      ACCEPTED: 'Đã chấp nhận',
      REJECTED: 'Đã từ chối',
      COMPLETED: 'Đã hoàn thành',
    };
    return texts[status] || status;
  }
}
