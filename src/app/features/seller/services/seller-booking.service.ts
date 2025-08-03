import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SellerBookingSummary } from '../models/seller-booking-summary.model';
import { PagingDTO } from '../../../core/models/paging.model';
import { SellerBookingDetail } from '../models/seller-booking-detail.model';
import { BookingRequestCustomer } from '../models/booking-request-customer.model';
import { SellerBookingCreateRequest } from '../models/seller-booking-create-request.model';
import { SellerBookingUpdateRequest } from '../models/seller-booking-update-request.model';
import { SellerMailRequest } from '../models/seller-mail-request.model';
import { BookingStatus } from '../../../core/models/enums';

@Injectable({
  providedIn: 'root',
})
export class SellerBookingService {
  private apiUrl = `${environment.apiUrl}/seller/bookings`;
  private mailApiUrl = `${environment.apiUrl}/seller/mail`;

  constructor(private http: HttpClient) {}

  /**
   * Cập nhật trạng thái của booking
   * @param bookingId - ID của booking
   * @param status - Trạng thái mới
   */
  updateBookingStatus(
    bookingId: number,
    status: BookingStatus
  ): Observable<ApiResponse<SellerBookingDetail>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<SellerBookingDetail>>(
      `${this.apiUrl}/${bookingId}/status`,
      {},
      { params }
    );
  }

  /**
   * Gửi mail xác nhận cho khách hàng
   * @param mailData - Thông tin mail cần gửi
   */
  sendConfirmationEmail(
    mailData: SellerMailRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.mailApiUrl, mailData);
  }

  /**
   * Cập nhật thông tin người đặt tour
   * @param bookingId - ID của booking
   * @param requestData - Dữ liệu cần cập nhật
   */
  updateBookedPerson(
    bookingId: number,
    requestData: SellerBookingUpdateRequest
  ): Observable<ApiResponse<SellerBookingDetail>> {
    return this.http.put<ApiResponse<SellerBookingDetail>>(
      `${this.apiUrl}/${bookingId}`,
      requestData
    );
  }

  /**
   * Cập nhật thông tin của một khách hàng trong đoàn
   * @param customerId ID của khách hàng cần cập nhật
   * @param customerData Dữ liệu mới của khách hàng
   */
  updateCustomer(
    customerId: number,
    customerData: BookingRequestCustomer
  ): Observable<ApiResponse<SellerBookingDetail>> {
    return this.http.put<ApiResponse<SellerBookingDetail>>(
      `${this.apiUrl}/customers/${customerId}`,
      customerData
    );
  }

  /**
   * Xóa một khách hàng khỏi booking
   * @param customerId ID của khách hàng cần xóa
   */
  deleteCustomer(
    customerId: number
  ): Observable<ApiResponse<SellerBookingDetail>> {
    return this.http.delete<ApiResponse<SellerBookingDetail>>(
      `${this.apiUrl}/customers/${customerId}`
    );
  }

  /**
   * Gửi mail xác nhận cho khách hàng
   * @param mailData - Thông tin mail cần gửi
   */
  // sendConfirmationEmail(mailData: {
  //   email: string;
  //   subject: string;
  //   content: string;
  // }): Observable<ApiResponse<string>> {
  //   return this.http.post<ApiResponse<string>>(
  //     `${environment.apiUrl}/seller/mail`,
  //     mailData
  //   );
  // }

  /**
   * Tạo một booking mới từ trang của Seller
   * @param requestData - Dữ liệu booking cần tạo
   */
  createBooking(
    requestData: SellerBookingCreateRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, requestData);
  }

  /**
   * Lấy danh sách các booking chưa có người xử lý
   * @param page - Trang hiện tại
   * @param size - Số lượng mục trên mỗi trang
   */
  getAvailableBookings(
    page: number,
    size: number
  ): Observable<ApiResponse<PagingDTO<SellerBookingSummary>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PagingDTO<SellerBookingSummary>>>(
      `${this.apiUrl}/available`,
      { params }
    );
  }

  /**
   * Lấy danh sách các booking do seller hiện tại xử lý
   * @param sellerUsername - Tên đăng nhập của seller
   * @param page - Trang hiện tại
   * @param size - Số lượng mục trên mỗi trang
   */
  getEditedBookings(
    sellerUsername: string,
    page: number,
    size: number
  ): Observable<ApiResponse<PagingDTO<SellerBookingSummary>>> {
    const params = new HttpParams()
      .set('sellerUsername', sellerUsername)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PagingDTO<SellerBookingSummary>>>(
      `${this.apiUrl}/edited`,
      { params }
    );
  }

  /**
   * Lấy chi tiết một booking
   * @param bookingId - ID của booking
   */
  getBookingDetail(
    bookingId: number
  ): Observable<ApiResponse<SellerBookingDetail>> {
    return this.http.get<ApiResponse<SellerBookingDetail>>(
      `${this.apiUrl}/${bookingId}`
    );
  }

  /**
   * Seller nhận xử lý một booking
   * @param bookingId - ID của booking
   * @param sellerUsername - Tên đăng nhập của seller
   */
  claimBooking(
    bookingId: number,
    sellerUsername: string
  ): Observable<ApiResponse<SellerBookingDetail>> {
    const params = new HttpParams().set('sellerUsername', sellerUsername);
    return this.http.patch<ApiResponse<SellerBookingDetail>>(
      `${this.apiUrl}/${bookingId}/claim`,
      {},
      { params }
    );
  }

  /**
   * Cập nhật ngày khởi hành cho booking
   * @param bookingId - ID của booking
   * @param scheduleId - ID của lịch trình mới
   */
  updateBookingSchedule(
    bookingId: number,
    scheduleId: number
  ): Observable<ApiResponse<SellerBookingDetail>> {
    const params = new HttpParams().set('scheduleId', scheduleId.toString());
    return this.http.put<ApiResponse<SellerBookingDetail>>(
      `${this.apiUrl}/${bookingId}/schedule`,
      {},
      { params }
    );
  }

  /**
   * Thêm khách hàng vào một booking đã có
   * @param bookingId - ID của booking
   * @param scheduleId - ID của lịch trình
   * @param customers - Danh sách khách hàng mới
   */
  addCustomersToSchedule(
    bookingId: number,
    scheduleId: number,
    customers: BookingRequestCustomer[]
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/${bookingId}/schedule/${scheduleId}/customers`,
      customers
    );
  }

  // Sẽ thêm hàm createBooking sau khi có component
}
