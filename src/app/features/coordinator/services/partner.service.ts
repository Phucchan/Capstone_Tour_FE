import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Paging } from '../../../core/models/paging.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  PartnerDetail,
  PartnerSummary,
  PartnerUpdateRequest,
} from '../models/partner.model';

// DTO cho việc thay đổi trạng thái
export interface ChangeStatusRequest {
  deleted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private apiUrl = `${environment.apiUrl}/coordinator/partners`;

  constructor(private http: HttpClient) {}

  getPartners(
    page: number,
    size: number,
    keyword?: string,
    isDeleted?: boolean,
    sortField: string = 'deleted',
    sortDirection: string = 'asc'
  ): Observable<ApiResponse<Paging<PartnerSummary>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortField', sortField)
      .set('sortDirection', sortDirection);

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (isDeleted !== undefined && isDeleted !== null) {
      params = params.set('isDeleted', isDeleted.toString());
    }

    return this.http.get<ApiResponse<Paging<PartnerSummary>>>(this.apiUrl, {
      params,
    });
  }

  getPartnerDetail(id: number): Observable<ApiResponse<PartnerDetail>> {
    return this.http.get<ApiResponse<PartnerDetail>>(`${this.apiUrl}/${id}`);
  }

  addPartner(
    request: PartnerUpdateRequest
  ): Observable<ApiResponse<PartnerDetail>> {
    return this.http.post<ApiResponse<PartnerDetail>>(this.apiUrl, request);
  }

  updatePartner(
    id: number,
    request: PartnerUpdateRequest
  ): Observable<ApiResponse<PartnerDetail>> {
    return this.http.put<ApiResponse<PartnerDetail>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * === HÀM ĐÃ SỬA HOÀN CHỈNH ===
   * Thay đổi trạng thái (soft-delete/restore) của đối tác.
   * Gọi trực tiếp đến endpoint PATCH mới của backend.
   */
  changePartnerStatus(
    id: number,
    request: ChangeStatusRequest
  ): Observable<ApiResponse<PartnerSummary>> {
    return this.http.patch<ApiResponse<PartnerSummary>>(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }
}
