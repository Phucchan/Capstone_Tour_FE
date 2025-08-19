import { Component, OnInit, inject } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  Location,
} from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EMPTY, Observable, Subject, combineLatest } from 'rxjs';
import { switchMap, catchError, startWith, map } from 'rxjs/operators';

// --- Services & Models ---
import { RequestBookingService } from '../../services/request-booking.service';
import { TourService } from '../../../../core/services/tour.service';
import {
  RequestBookingDetail,
  RequestBookingStatus,
} from '../../models/request-booking.model';
import { TourOptionsData } from '../../../../core/models/tour.model';

// --- NG-ZORRO Imports ---
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-request-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    CurrencyPipe,
    NzPageHeaderModule,
    NzGridModule,
    NzCardModule,
    NzDescriptionsModule,
    NzTagModule,
    NzButtonModule,
    NzSpinModule,
    NzInputModule,
    NzIconModule,
  ],
  templateUrl: './request-booking-detail.component.html',
})
export class RequestBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private requestBookingService = inject(RequestBookingService);
  private tourService = inject(TourService);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

  viewData$!: Observable<{
    request: RequestBookingDetail;
    departureLocationName: string;
    destinationLocationNames: string[];
    tourThemeNames: string[];
  }>;

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

    const request$ = this.refreshTrigger$.pipe(
      startWith(undefined),
      switchMap(() => id$),
      switchMap((id) => this.requestBookingService.getRequestDetail(id)),
      catchError((err: any) => {
        console.error(err);
        this.message.error('Không tìm thấy yêu cầu này.');
        this.router.navigate(['/business/request-bookings']);
        return EMPTY;
      })
    );

    const options$ = this.tourService.getTourOptions();

    this.viewData$ = combineLatest([request$, options$]).pipe(
      map(([request, options]) => {
        const departureLocationName =
          options.departures.find((d) => d.id === request.departureLocationId)
            ?.name || 'Không xác định';

        const destinationLocationNames = (request.destinationLocationIds || [])
          .map(
            (id) => options.destinations.find((d) => d.id === id)?.name || ''
          )
          .filter((name) => name);

        const tourThemeNames = (request.tourThemeIds || [])
          .map((id) => options.themes.find((t) => t.id === id)?.name || '')
          .filter((name) => name);

        return {
          request,
          departureLocationName,
          destinationLocationNames,
          tourThemeNames,
        };
      })
    );
  }

  updateStatus(id: number, status: 'ACCEPTED' | 'REJECTED'): void {
    if (status === 'REJECTED') {
      this.showRejectModal(id);
    } else {
      this.modal.confirm({
        nzTitle: 'Bạn có chắc chắn muốn chấp nhận yêu cầu này?',
        nzContent: 'Hành động này sẽ xác nhận yêu cầu và cho phép tạo tour.',
        nzOnOk: () => this.performUpdate(id, 'ACCEPTED'),
      });
    }
  }

  showRejectModal(id: number): void {
    let reason = '';
    // Đây là cách đơn giản, nếu cần phức tạp hơn, nên tạo một component riêng cho nội dung modal.
    this.modal.create({
      nzTitle: 'Bạn có chắc chắn muốn từ chối yêu cầu này?',
      nzContent: `
        <p class="mb-2">Vui lòng nhập lý do từ chối:</p>
        <textarea nz-input [(ngModel)]="reason" rows="3" placeholder="Yêu cầu không khả thi vì..."></textarea>
      `,
      nzOnOk: () => {
        if (!reason.trim()) {
          this.message.error('Lý do từ chối không được để trống.');
          return false; // Ngăn không cho modal đóng
        }
        return this.performUpdate(id, 'REJECTED', reason);
      },
    });
  }

  private performUpdate(
    id: number,
    status: 'ACCEPTED' | 'REJECTED',
    reason?: string
  ): void {
    const action = status === 'ACCEPTED' ? 'chấp nhận' : 'từ chối';
    const apiCall =
      status === 'REJECTED'
        ? this.requestBookingService.rejectRequest(id, reason!)
        : this.requestBookingService.updateRequestStatus(id, status);

    apiCall.subscribe({
      next: () => {
        this.message.success(`Đã ${action} yêu cầu thành công.`);
        this.refreshTrigger$.next();
      },
      error: (err: any) =>
        this.message.error(
          `Có lỗi xảy ra: ${err.error?.message || 'Không thể cập nhật'}`
        ),
    });
  }

  createTour(request: RequestBookingDetail): void {
    this.router.navigate(['/business/tours/new'], {
      queryParams: {
        requestBookingId: request.id,
        tourType: 'CUSTOM',
        startDate: request.startDate,
        endDate: request.endDate,
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  getStatusClass(status: RequestBookingStatus): string {
    const classes = {
      [RequestBookingStatus.PENDING]: 'gold',
      [RequestBookingStatus.ACCEPTED]: 'green',
      [RequestBookingStatus.REJECTED]: 'red',
      [RequestBookingStatus.COMPLETED]: 'blue',
    };
    return classes[status] || 'default';
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
