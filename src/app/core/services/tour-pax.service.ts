import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ServiceBreakdownDTO,
  TourPaxCreateRequestDTO,
  TourPaxFullDTO,
  TourPaxUpdateRequestDTO,
  TourPriceCalculateRequestDTO,
  TourDayManagerDTO,
} from '../models/tour.model';

@Injectable({
  providedIn: 'root',
})
export class TourPaxService {
  private http = inject(HttpClient);
  // URL cơ sở trỏ đến TourPaxController
  private getBaseUrl(tourId: number) {
    return `${environment.apiUrl}/business/tour/${tourId}/tour-pax`;
  }

  // URL cho API lấy danh sách dịch vụ chiết tính
  private getServiceBreakdownUrl(tourId: number) {
    return `${environment.apiUrl}/business/tours/${tourId}/services`;
  }

  // URL cho API quản lý dịch vụ trong ngày
  private getTourDayServiceUrl(
    tourId: number,
    dayId: number,
    serviceId: number
  ) {
    return `${environment.apiUrl}/business/tours/${tourId}/days/${dayId}/services/${serviceId}`;
  }
  /**
   * Thêm một dịch vụ vào một ngày trong tour
   */
  addServiceToTourDay(
    tourId: number,
    dayId: number,
    serviceId: number
  ): Observable<TourDayManagerDTO> {
    return this.http
      .post<ApiResponse<TourDayManagerDTO>>(
        this.getTourDayServiceUrl(tourId, dayId, serviceId),
        {}
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Xóa một dịch vụ khỏi một ngày trong tour
   */
  removeServiceFromTourDay(
    tourId: number,
    dayId: number,
    serviceId: number
  ): Observable<TourDayManagerDTO> {
    return this.http
      .delete<ApiResponse<TourDayManagerDTO>>(
        this.getTourDayServiceUrl(tourId, dayId, serviceId)
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Lấy danh sách các cấu hình khoảng khách của một tour
   */
  getTourPaxConfigurations(tourId: number): Observable<TourPaxFullDTO[]> {
    return this.http
      .get<ApiResponse<TourPaxFullDTO[]>>(this.getBaseUrl(tourId))
      .pipe(map((res) => res.data));
  }

  /**
   * Lấy danh sách chi tiết các dịch vụ đã được thêm vào tour để chiết tính
   */
  getServiceBreakdown(tourId: number): Observable<ServiceBreakdownDTO[]> {
    return this.http
      .get<ApiResponse<ServiceBreakdownDTO[]>>(
        this.getServiceBreakdownUrl(tourId)
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Gửi yêu cầu tính toán giá tour và trả về danh sách TourPax đã được cập nhật giá
   */
  calculatePrices(
    tourId: number,
    data: TourPriceCalculateRequestDTO
  ): Observable<TourPaxFullDTO[]> {
    return this.http
      .post<ApiResponse<TourPaxFullDTO[]>>(
        `${this.getBaseUrl(tourId)}/calculate-prices`,
        data
      )
      .pipe(map((res) => res.data));
  }

  // Các hàm Thêm/Sửa/Xóa cho Dịch vụ và Khoảng khách
  createTourPax(
    tourId: number,
    data: TourPaxCreateRequestDTO
  ): Observable<TourPaxFullDTO> {
    return this.http
      .post<ApiResponse<TourPaxFullDTO>>(
        `${this.getBaseUrl(tourId)}/create`,
        data
      )
      .pipe(map((res) => res.data));
  }

  updateTourPax(
    tourId: number,
    paxId: number,
    data: TourPaxUpdateRequestDTO
  ): Observable<TourPaxFullDTO> {
    return this.http
      .put<ApiResponse<TourPaxFullDTO>>(
        `${this.getBaseUrl(tourId)}/update/${paxId}`,
        data
      )
      .pipe(map((res) => res.data));
  }

  deleteTourPax(tourId: number, paxId: number): Observable<string> {
    return this.http
      .delete<ApiResponse<string>>(`${this.getBaseUrl(tourId)}/${paxId}`)
      .pipe(map((res) => res.message));
  }
}
