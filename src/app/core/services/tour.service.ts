import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  TourListItem,
  TourDetail,
  TourOptionsData,
  CreateTourRequest,
  UpdateTourRequest,
  TourDetailWithOptions,
  TourDayManagerDTO,
  TourDayManagerCreateRequestDTO,
  ServiceTypeShortDTO,
  ServiceInfoDTO,
  PartnerServiceCreateDTO,
} from '../models/tour.model';
import { Paging } from '../../core/models/paging.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private baseApiUrl = `${environment.apiUrl}/business`;
  private toursApiUrl = `${this.baseApiUrl}/tours`;

  constructor(private http: HttpClient) {}

  getTours(filters: any): Observable<Paging<TourListItem>> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('size', filters.size.toString());
    if (filters.keyword) params = params.set('keyword', filters.keyword);
    if (filters.tourType) params = params.set('tourType', filters.tourType);
    if (filters.tourStatus)
      params = params.set('tourStatus', filters.tourStatus);
    return this.http
      .get<ApiResponse<Paging<TourListItem>>>(this.toursApiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getTourOptions(): Observable<TourOptionsData> {
    return this.http
      .get<ApiResponse<TourOptionsData>>(`${this.toursApiUrl}/options`)
      .pipe(map((response) => response.data));
  }

  createTour(tourData: CreateTourRequest): Observable<TourDetail> {
    return this.http
      .post<ApiResponse<TourDetail>>(this.toursApiUrl, tourData)
      .pipe(map((response) => response.data));
  }

  getTourById(id: number): Observable<TourDetailWithOptions> {
    return this.http
      .get<ApiResponse<TourDetailWithOptions>>(`${this.toursApiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  updateTour(id: number, tourData: UpdateTourRequest): Observable<TourDetail> {
    return this.http
      .put<ApiResponse<TourDetail>>(`${this.toursApiUrl}/${id}`, tourData)
      .pipe(map((response) => response.data));
  }

  /**
   * Tạo tour mới với file ảnh (sử dụng FormData)
   * @param formData Dữ liệu form bao gồm file và thông tin tour
   * @returns Chi tiết tour đã tạo
   */
  createTourWithFile(formData: FormData): Observable<TourDetail> {
    // Lưu ý: Không cần set Content-Type header, Angular sẽ tự động làm điều đó
    return this.http
      .post<ApiResponse<TourDetail>>(`${this.toursApiUrl}`, formData)
      .pipe(map((response) => response.data));
  }

  /**
   * Cập nhật tour với file ảnh (sử dụng FormData)
   * @param id ID của tour cần cập nhật
   * @param formData Dữ liệu form bao gồm file và thông tin tour
   * @returns Chi tiết tour đã cập nhật
   */
  updateTourWithFile(id: number, formData: FormData): Observable<TourDetail> {
    return this.http
      .put<ApiResponse<TourDetail>>(`${this.toursApiUrl}/${id}`, formData)
      .pipe(map((response) => response.data));
  }

  getTourDays(tourId: number): Observable<TourDayManagerDTO[]> {
    return this.http
      .get<ApiResponse<TourDayManagerDTO[]>>(
        `${this.toursApiUrl}/${tourId}/days`
      )
      .pipe(map((res) => res.data));
  }

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

  deleteTourDay(tourId: number, dayId: number): Observable<string> {
    return this.http
      .delete<ApiResponse<string>>(
        `${this.toursApiUrl}/${tourId}/days/${dayId}`
      )
      .pipe(map((res) => res.message));
  }

  getServiceTypes(): Observable<ServiceTypeShortDTO[]> {
    return this.http
      .get<ApiResponse<ServiceTypeShortDTO[]>>(
        `${this.baseApiUrl}/service-types`
      )
      .pipe(map((res) => res.data));
  }
  /**
   * Thêm một dịch vụ cụ thể vào một ngày trong tour
   * @param tourId ID của tour
   * @param dayId ID của ngày
   * @param serviceId ID của dịch vụ cần thêm
   * @returns Dữ liệu ngày đã được cập nhật
   */
  addServiceToTourDay(
    tourId: number,
    dayId: number,
    serviceId: number
  ): Observable<TourDayManagerDTO> {
    const url = `${this.toursApiUrl}/${tourId}/days/${dayId}/services/${serviceId}`;
    return this.http
      .post<ApiResponse<TourDayManagerDTO>>(url, {})
      .pipe(map((res) => res.data));
  }

  /**
   * Xóa một dịch vụ cụ thể khỏi một ngày trong tour
   * @param tourId ID của tour
   * @param dayId ID của ngày
   * @param serviceId ID của dịch vụ cần xóa
   * @returns Dữ liệu ngày đã được cập nhật
   */
  removeServiceFromTourDay(
    tourId: number,
    dayId: number,
    serviceId: number
  ): Observable<TourDayManagerDTO> {
    const url = `${this.toursApiUrl}/${tourId}/days/${dayId}/services/${serviceId}`;
    return this.http
      .delete<ApiResponse<TourDayManagerDTO>>(url)
      .pipe(map((res) => res.data));
  }
  /**
   * Thêm hàm này để gọi API tạo dịch vụ mới
   */
  createServiceForTourDay(
    tourId: number,
    dayId: number,
    payload: PartnerServiceCreateDTO
  ): Observable<ServiceInfoDTO> {
    const url = `${this.toursApiUrl}/${tourId}/days/${dayId}/services`;
    return this.http
      .post<ApiResponse<ServiceInfoDTO>>(url, payload)
      .pipe(map((res) => res.data));
  }

  /**
   * Thay đổi trạng thái của một tour (ví dụ: DRAFT -> PUBLISHED)
   * @param id ID của tour
   * @param newStatus Trạng thái mới
   * @returns Observable<void>
   */
  changeTourStatus(id: number, newStatus: string): Observable<void> {
    const url = `${this.toursApiUrl}/${id}/status`;
    const payload = { newStatus: newStatus };
    // API này trả về GeneralResponse<Object> với data là null,
    // nên chúng ta có thể map nó về void.
    return this.http
      .patch<ApiResponse<void>>(url, payload)
      .pipe(map(() => void 0)); // Bỏ qua dữ liệu trả về
  }
}
