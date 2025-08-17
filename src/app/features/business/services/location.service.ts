import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LocationDTO } from '../../../core/models/location.model';
import { Paging } from '../../../core/models/paging.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/business/locations`;

  constructor(private http: HttpClient) {}

  getLocations(
    page: number,
    size: number,
    keyword?: string
  ): Observable<ApiResponse<Paging<LocationDTO>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<ApiResponse<Paging<LocationDTO>>>(this.apiUrl, {
      params,
    });
  }

  /**
   * Lấy thông tin chi tiết của một địa điểm theo ID.
   * @param id - ID của địa điểm.
   * @returns Observable chứa response từ API.
   */
  getLocationById(id: number): Observable<ApiResponse<LocationDTO>> {
    return this.http.get<ApiResponse<LocationDTO>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Tạo một địa điểm mới với file ảnh.
   * @param formData - Dữ liệu form chứa name, description, và file.
   */
  createLocation(formData: FormData): Observable<ApiResponse<LocationDTO>> {
    return this.http.post<ApiResponse<LocationDTO>>(this.apiUrl, formData);
  }

  /**
   * Cập nhật một địa điểm với file ảnh (tùy chọn).
   * @param id - ID của địa điểm.
   * @param formData - Dữ liệu form chứa name, description, và file (nếu có).
   */
  updateLocation(
    id: number,
    formData: FormData
  ): Observable<ApiResponse<LocationDTO>> {
    return this.http.put<ApiResponse<LocationDTO>>(
      `${this.apiUrl}/${id}`,
      formData
    );
  }
}
