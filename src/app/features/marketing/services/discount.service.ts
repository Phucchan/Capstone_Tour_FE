// src/app/features/marketing/services/discount.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Paging } from '../../../core/models/paging.model';
import {
  TourDiscountRequest,
  TourDiscountSummary,
  TourScheduleSelectItem,
} from '../models/tour-discount.model';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/marketing/discounts`;
  private scheduleApiUrl = `${environment.apiUrl}/business/schedules`; // Giả định URL API để tìm kiếm schedule

  /**
   * Lấy danh sách khuyến mãi có phân trang và tìm kiếm.
   * @param keyword Từ khóa tìm kiếm (tên tour)
   * @param page Trang hiện tại
   * @param size Số lượng mục trên mỗi trang
   * @returns Danh sách khuyến mãi
   */
  getDiscounts(
    keyword: string,
    page: number,
    size: number
  ): Observable<ApiResponse<Paging<TourDiscountSummary>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<ApiResponse<Paging<TourDiscountSummary>>>(
      this.apiUrl,
      { params }
    );
  }

  /**
   * Tạo một chương trình khuyến mãi mới.
   * @param request Dữ liệu khuyến mãi mới
   * @returns Khuyến mãi vừa được tạo
   */
  createDiscount(
    request: TourDiscountRequest
  ): Observable<ApiResponse<TourDiscountSummary>> {
    return this.http.post<ApiResponse<TourDiscountSummary>>(
      this.apiUrl,
      request
    );
  }

  /**
   * API giả định để tìm kiếm lịch trình tour cho ô select.
   * Cần được triển khai ở backend.
   * @param keyword Tên tour để tìm kiếm
   * @returns Danh sách các lịch trình phù hợp
   */
  searchTourSchedules(
    keyword: string
  ): Observable<ApiResponse<TourScheduleSelectItem[]>> {
    let params = new HttpParams();
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    // Ví dụ: GET /api/business/schedules/search?keyword=...
    return this.http.get<ApiResponse<TourScheduleSelectItem[]>>(
      `${this.scheduleApiUrl}/search`,
      { params }
    );
  }
}
