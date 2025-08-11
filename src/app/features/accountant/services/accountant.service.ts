
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
import { BookingList } from '../models/booking-list.model';
import { BookingSettlement } from '../models/booking-settlement.model';
import { CreateBillRequest } from '../models/create-bill-request.model';

@Injectable({
  providedIn: 'root',
})
export class AccountantService {
  private http = inject(HttpClient);
  private refundApiUrl = `${environment.apiUrl}/accountant/refunds`;
  private bookingApiUrl = `${environment.apiUrl}/accountant/bookings`;
  private billsApiUrl = `${environment.apiUrl}/accountant/bills`;

  //REFUND MANAGEMENT APIS (Luồng Hoàn tiền)

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
      .get<ApiResponse<PagingDTO<BookingRefund>>>(this.refundApiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getRefundRequestDetail(bookingId: number): Observable<BookingRefundDetail> {
    return this.http
      .get<ApiResponse<BookingRefundDetail>>(
        `${this.refundApiUrl}/${bookingId}`
      )
      .pipe(map((response) => response.data));
  }

  confirmCancellation(bookingId: number): Observable<BookingRefundDetail> {
    return this.http
      .patch<ApiResponse<BookingRefundDetail>>(
        `${this.refundApiUrl}/${bookingId}/cancel`,
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
        `${this.refundApiUrl}/${bookingId}/bill`,
        request
      )
      .pipe(map((response) => response.data));
  }

  // BOOKING SETTLEMENT APIS (Luồng Quyết toán)

  getBookings(
    search: string | null,
    page: number,
    size: number
  ): Observable<PagingDTO<BookingList>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http
      .get<ApiResponse<PagingDTO<BookingList>>>(this.bookingApiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getBookingSettlement(bookingId: number): Observable<BookingSettlement> {
    return this.http
      .get<ApiResponse<BookingSettlement>>(
        `${this.bookingApiUrl}/${bookingId}/settlement`
      )
      .pipe(map((response) => response.data));
  }

  createReceiptBill(
    bookingId: number,
    request: CreateBillRequest
  ): Observable<BookingSettlement> {
    return this.http
      .post<ApiResponse<BookingSettlement>>(
        `${this.bookingApiUrl}/${bookingId}/receipt-bill`,
        request
      )
      .pipe(map((response) => response.data));
  }

  createPaymentBill(
    bookingId: number,
    request: CreateBillRequest
  ): Observable<BookingSettlement> {
    return this.http
      .post<ApiResponse<BookingSettlement>>(
        `${this.bookingApiUrl}/${bookingId}/payment-bill`,
        request
      )
      .pipe(map((response) => response.data));
  }

  markBillPaid(billId: number): Observable<string> {
    return this.http
      .patch<ApiResponse<string>>(`${this.billsApiUrl}/${billId}/paid`, {})
      .pipe(map((response) => response.data));
  }

  markBookingCompleted(bookingId: number): Observable<string> {
    return this.http
      .patch<ApiResponse<string>>(
        `${this.bookingApiUrl}/${bookingId}/complete`,
        {}
      )
      .pipe(map((response) => response.data));
  }
}
