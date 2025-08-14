// src/app/features/business/services/request-booking.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  RequestBookingPage,
  RequestBookingDetail,
} from '../models/request-booking.model';
import { TourDetail } from '../../../core/models/tour.model';

@Injectable({
  providedIn: 'root',
})
export class RequestBookingService {
  private http = inject(HttpClient);
  private baseApiUrl = `${environment.apiUrl}/business/request-bookings`;

  /**
   * Lấy danh sách các yêu cầu đặt tour (phân trang)
   * @param page Số trang
   * @param size Kích thước trang
   * @returns Dữ liệu phân trang của các yêu cầu
   */
  getRequests(page: number, size: number): Observable<RequestBookingPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<ApiResponse<RequestBookingPage>>(this.baseApiUrl, { params })
      .pipe(map((response) => response.data));
  }

  /**
   * Lấy chi tiết một yêu cầu đặt tour
   * @param id ID của yêu cầu
   * @returns Chi tiết yêu cầu
   */
  getRequestDetail(id: number): Observable<RequestBookingDetail> {
    return this.http
      .get<ApiResponse<RequestBookingDetail>>(`${this.baseApiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }
  /**
   * Cập nhật trạng thái của một yêu cầu
   * @param id ID của yêu cầu
   * @param newStatus Trạng thái mới ('ACCEPTED' hoặc 'REJECTED')
   * @returns Chi tiết yêu cầu đã được cập nhật
   */
  updateRequestStatus(
    id: number,
    newStatus: string
  ): Observable<RequestBookingDetail> {
    const payload = { newStatus };
    return this.http
      .patch<ApiResponse<RequestBookingDetail>>(
        `${this.baseApiUrl}/${id}/status`,
        payload
      )
      .pipe(map((response) => response.data));
  }

  rejectRequest(id: number, reason: string): Observable<RequestBookingDetail> {
    const payload = { reason };
    return this.http
      .patch<ApiResponse<RequestBookingDetail>>(
        `${this.baseApiUrl}/${id}/reject`,
        payload
      )
      .pipe(map((response) => response.data));
  }

  /**
   * Tạo một tour mới từ một yêu cầu đã có
   * @param requestId ID của yêu cầu
   * @returns Chi tiết tour vừa được tạo
   */
  createTourFromRequest(requestId: number): Observable<TourDetail> {
    const url = `${this.baseApiUrl}/tour-manager/request-bookings/${requestId}/create-tour`;
    return this.http
      .post<ApiResponse<TourDetail>>(url, {})
      .pipe(map((response) => response.data));
  }
}
