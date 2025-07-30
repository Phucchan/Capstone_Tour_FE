// src/app/core/services/tour-departure.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  TourSchedule,
  TourScheduleCreateRequest,
  TourScheduleOptions,
} from '../models/tour-schedule.model';

@Injectable({
  providedIn: 'root',
})
export class TourDepartureService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/business/tours`;

  /**
   * Lấy danh sách các lịch khởi hành (ngày mở bán) của một tour
   * GET /tours/{tourId}/schedules
   */
  getTourSchedules(tourId: number): Observable<TourSchedule[]> {
    return this.http
      .get<ApiResponse<TourSchedule[]>>(`${this.apiUrl}/${tourId}/schedules`)
      .pipe(map((res) => res.data));
  }

  /**
   * Lấy các tùy chọn cần thiết cho form tạo lịch (điều phối viên, gói giá)
   * GET /tours/{tourId}/schedule-options
   */
  getScheduleOptions(tourId: number): Observable<TourScheduleOptions> {
    return this.http
      .get<ApiResponse<TourScheduleOptions>>(
        `${this.apiUrl}/${tourId}/schedule-options`
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Tạo một lịch khởi hành mới
   * POST /tours/{tourId}/schedules
   */
  createTourSchedule(
    tourId: number,
    payload: TourScheduleCreateRequest
  ): Observable<TourSchedule> {
    return this.http
      .post<ApiResponse<TourSchedule>>(
        `${this.apiUrl}/${tourId}/schedules`,
        payload
      )
      .pipe(map((res) => res.data));
  }
}
