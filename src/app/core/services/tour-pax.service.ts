import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ServiceBreakdownDTO,
  TourPaxRequestDTO,
  TourPaxFullDTO,
  TourPriceCalculateRequestDTO,
  TourCostSummary,
} from '../models/tour.model';

@Injectable({
  providedIn: 'root',
})
export class TourPaxService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Lấy danh sách chi tiết các dịch vụ đã được thêm vào tour để chiết tính.
   * LƯU Ý: API này phải tồn tại ở backend theo đường dẫn /business/tours/{tourId}/services
   */
  getServiceBreakdown(tourId: number): Observable<ServiceBreakdownDTO[]> {
    return this.http
      .get<ApiResponse<ServiceBreakdownDTO[]>>(
        `${this.apiUrl}/business/tours/${tourId}/services`
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Lấy danh sách các cấu hình khoảng khách của một tour.
   */
  getTourPaxConfigurations(tourId: number): Observable<TourPaxFullDTO[]> {
    return this.http
      .get<ApiResponse<TourPaxFullDTO[]>>(
        `${this.apiUrl}/business/tour/${tourId}/tour-pax`
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Gửi yêu cầu tính toán lại giá tour.
   */
  calculatePrices(
    tourId: number,
    data: TourPriceCalculateRequestDTO
  ): Observable<TourPaxFullDTO[]> {
    return this.http
      .post<ApiResponse<TourPaxFullDTO[]>>(
        `${this.apiUrl}/business/tour/${tourId}/tour-pax/calculate-prices`,
        data
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Tạo một khoảng khách mới.
   */
  createTourPax(
    tourId: number,
    data: TourPaxRequestDTO
  ): Observable<TourPaxFullDTO> {
    return this.http
      .post<ApiResponse<TourPaxFullDTO>>(
        `${this.apiUrl}/business/tour/${tourId}/tour-pax/create`,
        data
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Cập nhật một khoảng khách đã có.
   */
  updateTourPax(
    tourId: number,
    paxId: number,
    data: TourPaxRequestDTO
  ): Observable<TourPaxFullDTO> {
    return this.http
      .put<ApiResponse<TourPaxFullDTO>>(
        `${this.apiUrl}/business/tour/${tourId}/tour-pax/update/${paxId}`,
        data
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Xóa một khoảng khách.
   */
  deleteTourPax(tourId: number, paxId: number): Observable<string> {
    return this.http
      .delete<ApiResponse<string>>(
        `${this.apiUrl}/business/tour/${tourId}/tour-pax/${paxId}`
      )
      .pipe(map((res) => res.message));
  }

  /**
   * Lấy tổng hợp chi phí gốc của tour.
   */
  getTourCostSummary(tourId: number): Observable<TourCostSummary> {
    return this.http
      .get<ApiResponse<TourCostSummary>>(
        `${this.apiUrl}/business/tours/${tourId}/cost-summary`
      )
      .pipe(map((res) => res.data));
  }
}
