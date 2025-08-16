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

  private getPaxBaseUrl(tourId: number): string {
    // Reverted to the original API URL structure
    return `${this.apiUrl}/business/tour/${tourId}/tour-pax`;
  }

  /**
   * Lấy danh sách chi tiết các dịch vụ đã được thêm vào tour để chiết tính.
   * FIX: Reverted the endpoint to its original form to prevent 500 error.
   * Please verify this endpoint with your backend API documentation.
   */
  getServiceBreakdown(tourId: number): Observable<ServiceBreakdownDTO[]> {
    return this.http
      .get<ApiResponse<ServiceBreakdownDTO[]>>(
        // The original endpoint was likely just '/services'
        `${this.apiUrl}/business/tours/${tourId}/services`
      )
      .pipe(map((res) => res.data));
  }

  getTourPaxConfigurations(tourId: number): Observable<TourPaxFullDTO[]> {
    return this.http
      .get<ApiResponse<TourPaxFullDTO[]>>(this.getPaxBaseUrl(tourId))
      .pipe(map((res) => res.data));
  }

  calculateAndSavePrices(
    tourId: number,
    data: TourPriceCalculateRequestDTO
  ): Observable<TourPaxFullDTO[]> {
    return this.http
      .post<ApiResponse<TourPaxFullDTO[]>>(
        `${this.getPaxBaseUrl(tourId)}/calculate-prices`,
        data
      )
      .pipe(map((res) => res.data));
  }

  createTourPax(
    tourId: number,
    data: TourPaxRequestDTO
  ): Observable<TourPaxFullDTO> {
    return this.http
      .post<ApiResponse<TourPaxFullDTO>>(
        `${this.getPaxBaseUrl(tourId)}/create`,
        data
      )
      .pipe(map((res) => res.data));
  }

  updateTourPax(
    tourId: number,
    paxId: number,
    data: TourPaxRequestDTO
  ): Observable<TourPaxFullDTO> {
    return this.http
      .put<ApiResponse<TourPaxFullDTO>>(
        `${this.getPaxBaseUrl(tourId)}/update/${paxId}`,
        data
      )
      .pipe(map((res) => res.data));
  }

  deleteTourPax(tourId: number, paxId: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.getPaxBaseUrl(tourId)}/${paxId}`)
      .pipe(map((res) => res.data));
  }

  getTourCostSummary(tourId: number): Observable<TourCostSummary> {
    return this.http
      .get<ApiResponse<TourCostSummary>>(
        `${this.apiUrl}/business/tours/${tourId}/cost-summary`
      )
      .pipe(map((res) => res.data));
  }
}
