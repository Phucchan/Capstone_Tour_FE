import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  GeneralResponse,
  LocationDTO,
  LocationRequestDTO,
} from '../../../core/models/location.model';
import { Paging } from '../../../core/models/paging.model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  // Lấy URL của API từ file environment
  private apiUrl = `${environment.apiUrl}/business/locations`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách các địa điểm có phân trang và tìm kiếm.
   * @param page - Số trang hiện tại (bắt đầu từ 0).
   * @param size - Số lượng mục trên mỗi trang.
   * @param keyword - Từ khóa để tìm kiếm theo tên (tùy chọn).
   * @returns Observable chứa response từ API.
   */
  getLocations(
    page: number,
    size: number,
    keyword?: string
  ): Observable<GeneralResponse<Paging<LocationDTO>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<GeneralResponse<Paging<LocationDTO>>>(this.apiUrl, {
      params,
    });
  }

  /**
   * Lấy thông tin chi tiết của một địa điểm theo ID.
   * @param id - ID của địa điểm.
   * @returns Observable chứa response từ API.
   */
  getLocationById(id: number): Observable<GeneralResponse<LocationDTO>> {
    return this.http.get<GeneralResponse<LocationDTO>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Tạo một địa điểm mới.
   * @param locationData - Dữ liệu của địa điểm cần tạo.
   * @returns Observable chứa response từ API.
   */
  createLocation(
    locationData: LocationRequestDTO
  ): Observable<GeneralResponse<LocationDTO>> {
    return this.http.post<GeneralResponse<LocationDTO>>(
      this.apiUrl,
      locationData
    );
  }

  /**
   * Cập nhật thông tin một địa điểm.
   * @param id - ID của địa điểm cần cập nhật.
   * @param locationData - Dữ liệu mới của địa điểm.
   * @returns Observable chứa response từ API.
   */
  updateLocation(
    id: number,
    locationData: LocationRequestDTO
  ): Observable<GeneralResponse<LocationDTO>> {
    return this.http.put<GeneralResponse<LocationDTO>>(
      `${this.apiUrl}/${id}`,
      locationData
    );
  }

  // sẽ thêm hàm delete/changeStatus ở đây sau khi backend sẵn sàng.
}
