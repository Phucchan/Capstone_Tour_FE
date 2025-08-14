import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SellerBookingSummary } from '../models/seller-booking-summary.model';
import { Paging } from '../../../core/models/paging.model';
import { SellerBookingDetail } from '../models/seller-booking-detail.model';
import { BookingRequestCustomer } from '../models/booking-request-customer.model';
import { SellerBookingCreateRequest } from '../models/seller-booking-create-request.model';
import { SellerBookingUpdateRequest } from '../models/seller-booking-update-request.model';
import { RequestBookingSummary } from '../models/request-booking-summary.model';
import { RequestBookingDetail } from '../models/request-booking-detail.model';
import { SellerMailRequest } from '../models/seller-mail-request.model';
import { BookingStatus } from '../../../core/models/enums';

@Injectable({
  providedIn: 'root',
})
export class SellerBookingService {
  private bookingApiUrl = `${environment.apiUrl}/seller/bookings`;
  private requestApiUrl = `${environment.apiUrl}/seller/request-bookings`;
  private mailApiUrl = `${environment.apiUrl}/seller/mail`;

  constructor(private http: HttpClient) {}

  // ==================================================
  // CÁC PHƯƠNG THỨC LIÊN QUAN ĐẾN BOOKING
  // ==================================================

  updateBookingStatus(
    bookingId: number,
    status: BookingStatus
  ): Observable<ApiResponse<SellerBookingDetail>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<SellerBookingDetail>>(
      `${this.bookingApiUrl}/${bookingId}/status`,
      {},
      { params }
    );
  }

  updateBookedPerson(
    bookingId: number,
    requestData: SellerBookingUpdateRequest
  ): Observable<ApiResponse<SellerBookingDetail>> {
    return this.http.put<ApiResponse<SellerBookingDetail>>(
      `${this.bookingApiUrl}/${bookingId}`,
      requestData
    );
  }

  updateCustomer(
    customerId: number,
    customerData: BookingRequestCustomer
  ): Observable<ApiResponse<SellerBookingDetail>> {
    return this.http.put<ApiResponse<SellerBookingDetail>>(
      `${this.bookingApiUrl}/customers/${customerId}`,
      customerData
    );
  }

  deleteCustomer(
    customerId: number
  ): Observable<ApiResponse<SellerBookingDetail>> {
    return this.http.delete<ApiResponse<SellerBookingDetail>>(
      `${this.bookingApiUrl}/customers/${customerId}`
    );
  }

  createBooking(
    requestData: SellerBookingCreateRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.bookingApiUrl, requestData);
  }

  getAvailableBookings(
    page: number,
    size: number
  ): Observable<ApiResponse<Paging<SellerBookingSummary>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Paging<SellerBookingSummary>>>(
      `${this.bookingApiUrl}/available`,
      { params }
    );
  }

  getEditedBookings(
    sellerUsername: string,
    page: number,
    size: number
  ): Observable<ApiResponse<Paging<SellerBookingSummary>>> {
    const params = new HttpParams()
      .set('sellerUsername', sellerUsername)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Paging<SellerBookingSummary>>>(
      `${this.bookingApiUrl}/edited`,
      { params }
    );
  }

  getBookingDetail(
    bookingId: number
  ): Observable<ApiResponse<SellerBookingDetail>> {
    return this.http.get<ApiResponse<SellerBookingDetail>>(
      `${this.bookingApiUrl}/${bookingId}`
    );
  }

  claimBooking(
    bookingId: number,
    sellerUsername: string
  ): Observable<ApiResponse<SellerBookingDetail>> {
    const params = new HttpParams().set('sellerUsername', sellerUsername);
    return this.http.patch<ApiResponse<SellerBookingDetail>>(
      `${this.bookingApiUrl}/${bookingId}/claim`,
      {},
      { params }
    );
  }

  updateBookingSchedule(
    bookingId: number,
    scheduleId: number
  ): Observable<ApiResponse<SellerBookingDetail>> {
    const params = new HttpParams().set('scheduleId', scheduleId.toString());
    return this.http.put<ApiResponse<SellerBookingDetail>>(
      `${this.bookingApiUrl}/${bookingId}/schedule`,
      {},
      { params }
    );
  }

  addCustomersToSchedule(
    bookingId: number,
    scheduleId: number,
    customers: BookingRequestCustomer[]
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.bookingApiUrl}/${bookingId}/schedule/${scheduleId}/customers`,
      customers
    );
  }

  // ==================================================
  // CÁC PHƯƠNG THỨC LIÊN QUAN ĐẾN REQUEST BOOKING (YÊU CẦU TÙY CHỈNH)
  // ==================================================

  getRequestBookings(
    page: number,
    size: number
  ): Observable<ApiResponse<Paging<RequestBookingSummary>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    // SỬA: Dùng đúng apiUrl cho request-bookings
    return this.http.get<ApiResponse<Paging<RequestBookingSummary>>>(
      this.requestApiUrl,
      { params }
    );
  }

  approveRequestBooking(
    requestId: number
  ): Observable<ApiResponse<RequestBookingDetail>> {
    // SỬA: Dùng đúng apiUrl cho request-bookings
    return this.http.patch<ApiResponse<RequestBookingDetail>>(
      `${this.requestApiUrl}/${requestId}/approve`,
      {}
    );
  }

  // ==================================================
  // CÁC PHƯƠNG THỨC LIÊN QUAN ĐẾN EMAIL
  // ==================================================

  // MỚI: Thêm phương thức gửi email tùy chỉnh theo kế hoạch
  sendCustomEmail(data: SellerMailRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.mailApiUrl, data);
  }
}
