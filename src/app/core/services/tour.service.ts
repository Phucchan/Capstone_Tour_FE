import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  TourListItem,
  PagingDTO,
  TourDetail,
  TourOptionsData,
  CreateTourRequest,
  UpdateTourRequest,
  TourDetailWithOptions,
} from '../models/tour.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private apiUrl = `${environment.apiUrl}/business/tours`;

  constructor(private http: HttpClient) {}

  getTours(filters: any): Observable<PagingDTO<TourListItem>> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('size', filters.size.toString());
    if (filters.keyword) params = params.set('keyword', filters.keyword);
    if (filters.tourType) params = params.set('tourType', filters.tourType);
    if (filters.tourStatus)
      params = params.set('tourStatus', filters.tourStatus);
    return this.http
      .get<ApiResponse<PagingDTO<TourListItem>>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  /**
   * @description Lấy tất cả các lựa chọn cho form tạo tour.
   */
  getTourOptions(): Observable<TourOptionsData> {
    return this.http
      .get<ApiResponse<TourOptionsData>>(`${this.apiUrl}/options`)
      .pipe(map((response) => response.data));
  }

  /**
   * @description Tạo một tour mới.
   */
  createTour(tourData: CreateTourRequest): Observable<TourDetail> {
    return this.http
      .post<ApiResponse<TourDetail>>(this.apiUrl, tourData)
      .pipe(map((response) => response.data));
  }

  /**
   * @description Lấy thông tin chi tiết của một tour theo ID.
   * API này giờ trả về cả detail và options.
   */
  getTourById(id: number): Observable<TourDetailWithOptions> {
    return this.http
      .get<ApiResponse<TourDetailWithOptions>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * @description Cập nhật một tour.
   */
  updateTour(id: number, tourData: UpdateTourRequest): Observable<TourDetail> {
    return this.http
      .put<ApiResponse<TourDetail>>(`${this.apiUrl}/${id}`, tourData)
      .pipe(map((response) => response.data));
  }
}
