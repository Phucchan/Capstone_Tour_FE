/*
----------------------------------------------------------------
-- File: src/app/features/accountant/services/accountant.service.ts
-- Ghi chú: Service để giao tiếp với API của Accountant.
----------------------------------------------------------------
*/
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PagingDTO } from '../../../core/models/paging.model';
import { BookingRefund } from '../models/booking-refund.model';
import { BookingRefundDetail } from '../models/booking-refund-detail.model';
import { RefundBillRequest } from '../models/refund-bill-request.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AccountantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accountant/refunds`;

  getRefundRequests(
    search: string | null,
    page: number,
    size: number
  ): Observable<PagingDTO<BookingRefund>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http
      .get<ApiResponse<PagingDTO<BookingRefund>>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getRefundRequestDetail(bookingId: number): Observable<BookingRefundDetail> {
    return this.http
      .get<ApiResponse<BookingRefundDetail>>(`${this.apiUrl}/${bookingId}`)
      .pipe(map((response) => response.data));
  }

  confirmCancellation(bookingId: number): Observable<BookingRefundDetail> {
    return this.http
      .patch<ApiResponse<BookingRefundDetail>>(
        `${this.apiUrl}/${bookingId}/cancel`,
        {}
      )
      .pipe(map((response) => response.data));
  }

  createRefundBill(
    bookingId: number,
    request: RefundBillRequest
  ): Observable<BookingRefundDetail> {
    return this.http
      .post<ApiResponse<BookingRefundDetail>>(
        `${this.apiUrl}/${bookingId}/bill`,
        request
      )
      .pipe(map((response) => response.data));
  }
}
