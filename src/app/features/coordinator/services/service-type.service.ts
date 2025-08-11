import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ChangeStatusRequest, ServiceType } from '../models/service-type.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceTypeService {
  private apiUrl = `${environment.apiUrl}/coordinator/service-types`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy tất cả loại dịch vụ
   * Tương ứng với: GET /cordinator/service-types
   */
  getServiceTypes(): Observable<ApiResponse<ServiceType[]>> {
    return this.http.get<ApiResponse<ServiceType[]>>(this.apiUrl);
  }

  /**
   * Tạo mới một loại dịch vụ
   * Tương ứng với: POST /cordinator/service-types
   */
  createServiceType(dto: {
    code: string;
    name: string;
  }): Observable<ApiResponse<ServiceType>> {
    return this.http.post<ApiResponse<ServiceType>>(this.apiUrl, dto);
  }

  /**
   * Cập nhật một loại dịch vụ
   * Tương ứng với: PUT /cordinator/service-types/{id}
   */
  updateServiceType(
    id: number,
    dto: { code?: string; name?: string }
  ): Observable<ApiResponse<ServiceType>> {
    return this.http.put<ApiResponse<ServiceType>>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Thay đổi trạng thái (kích hoạt/vô hiệu hóa)
   * Tương ứng với: PATCH /cordinator/service-types/{id}/status
   */
  changeStatus(
    id: number,
    request: ChangeStatusRequest
  ): Observable<ApiResponse<ServiceType>> {
    return this.http.patch<ApiResponse<ServiceType>>(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }
}
