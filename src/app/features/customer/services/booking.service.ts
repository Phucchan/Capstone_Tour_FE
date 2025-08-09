import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

type BookingStatus =
  | 'PENDING' | 'CONFIRMED' | 'CANCEL_REQUESTED'
  | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'REFUNDED';

type BookingItem = {
  id: number;
  tourId: number;
  bookingCode: string;
  tourName: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
};

type BookingListResponse = {
  status: number;
  code: number;
  message: string;
  data: {
    page: number;
    size: number;
    total: number;
    items: BookingItem[];
  };
};

type RefundInfoPayload = {
  bankAccountNumber: string;
  bankAccountHolder: string;
  bankName: string;
};

@Injectable({ providedIn: 'root' })
export class BookingService {
    base = `${environment.apiUrl}/users/bookings`;

  constructor(private http: HttpClient) {}

  getUserBookings(opts: {
    page: number; size: number; userId: number; status?: BookingStatus | string;
  }): Observable<any> {
    let params = new HttpParams()
      .set('page', opts.page)
      .set('size', opts.size)
      .set('userId', opts.userId);
    if (opts.status) params = params.set('status', opts.status);
    return this.http.get<any>(this.base, { params });
  }

  requestCancel(bookingId: number, userId: number) {
    const params = new HttpParams().set('userId', userId);
    return this.http.put(`${this.base}/${bookingId}/cancel-request`, {}, { params });
  }

  submitRefundInfo(bookingId: number, userId: number, body: RefundInfoPayload) {
    const params = new HttpParams().set('userId', userId);
    return this.http.post(`${this.base}/${bookingId}/refund-info`, body, { params });
  }
}
