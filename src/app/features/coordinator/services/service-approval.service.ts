import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Paging } from '../../../core/models/paging.model';
import {
  PendingServiceUpdateRequest,
  ServiceInfo,
} from '../models/service-approval.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceApprovalService {
  // Endpoint trỏ đến ServiceApprovalController
  private apiUrl = `${environment.apiUrl}/coordinator/services`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách các dịch vụ đang chờ duyệt (status = PENDING)
   * Tương ứng với: GET /coordinator/services/pending
   */
  getPendingServices(
    page: number,
    size: number,
    keyword?: string
  ): Observable<ApiResponse<Paging<ServiceInfo>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<ApiResponse<Paging<ServiceInfo>>>(
      `${this.apiUrl}/pending`,
      { params }
    );
  }

  /**
   * Cập nhật trạng thái của một dịch vụ (Phê duyệt hoặc Từ chối)
   * Tương ứng với: PUT /coordinator/services/{id}
   */
  updateServiceStatus(
    id: number,
    request: PendingServiceUpdateRequest
  ): Observable<ApiResponse<ServiceInfo>> {
    return this.http.put<ApiResponse<ServiceInfo>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }
}
