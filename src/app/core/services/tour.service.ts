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
  TourDayManagerDTO,
  TourDayManagerCreateRequestDTO,
  ServiceTypeShortDTO,
  PartnerServiceShortDTO,
} from '../models/tour.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private baseApiUrl = `${environment.apiUrl}/business`;
  private toursApiUrl = `${this.baseApiUrl}/tours`;

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
      .get<ApiResponse<PagingDTO<TourListItem>>>(this.toursApiUrl, { params })
      .pipe(map((response) => response.data));
  }

  /**
   * @description Lấy tất cả các lựa chọn cho form tạo tour.
   */
  getTourOptions(): Observable<TourOptionsData> {
    return this.http
      .get<ApiResponse<TourOptionsData>>(`${this.toursApiUrl}/options`)
      .pipe(map((response) => response.data));
  }

  /**
   * @description Tạo một tour mới.
   */
  createTour(tourData: CreateTourRequest): Observable<TourDetail> {
    return this.http
      .post<ApiResponse<TourDetail>>(this.toursApiUrl, tourData)
      .pipe(map((response) => response.data));
  }

  /**
   * @description Lấy thông tin chi tiết của một tour theo ID.
   * API này giờ trả về cả detail và options.
   */
  getTourById(id: number): Observable<TourDetailWithOptions> {
    return this.http
      .get<ApiResponse<TourDetailWithOptions>>(`${this.toursApiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * @description Cập nhật một tour.
   */
  updateTour(id: number, tourData: UpdateTourRequest): Observable<TourDetail> {
    return this.http
      .put<ApiResponse<TourDetail>>(`${this.toursApiUrl}/${id}`, tourData)
      .pipe(map((response) => response.data));
  }
  /**
   * Lấy danh sách các ngày trong lịch trình của một tour
   */
  getTourDays(tourId: number): Observable<TourDayManagerDTO[]> {
    return this.http
      .get<ApiResponse<TourDayManagerDTO[]>>(
        `${this.toursApiUrl}/${tourId}/days`
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Thêm một ngày mới vào lịch trình
   */
  addTourDay(
    tourId: number,
    data: TourDayManagerCreateRequestDTO
  ): Observable<TourDayManagerDTO> {
    return this.http
      .post<ApiResponse<TourDayManagerDTO>>(
        `${this.toursApiUrl}/${tourId}/days`,
        data
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Cập nhật một ngày trong lịch trình
   */
  updateTourDay(
    tourId: number,
    dayId: number,
    data: TourDayManagerCreateRequestDTO
  ): Observable<TourDayManagerDTO> {
    return this.http
      .put<ApiResponse<TourDayManagerDTO>>(
        `${this.toursApiUrl}/${tourId}/days/${dayId}`,
        data
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Xóa một ngày khỏi lịch trình
   */
  deleteTourDay(tourId: number, dayId: number): Observable<string> {
    return this.http
      .delete<ApiResponse<string>>(
        `${this.toursApiUrl}/${tourId}/days/${dayId}`
      )
      .pipe(map((res) => res.message));
  }

  /**
   * Lấy danh sách các loại dịch vụ để hiển thị trong form
   */
  getServiceTypes(): Observable<ServiceTypeShortDTO[]> {
    return this.http
      .get<ApiResponse<ServiceTypeShortDTO[]>>(
        `${this.baseApiUrl}/service-types`
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Lấy danh sách TẤT CẢ các dịch vụ từ đối tác để hiển thị trong dropdown
   */
  getAllPartnerServices(): Observable<PartnerServiceShortDTO[]> {
    return this.http
      .get<ApiResponse<PartnerServiceShortDTO[]>>(
        `${this.baseApiUrl}/partner-services` // Giả định API endpoint là đây
      )
      .pipe(map((res) => res.data));
  }
}
