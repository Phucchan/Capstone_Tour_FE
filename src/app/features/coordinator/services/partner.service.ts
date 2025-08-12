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
import { ChangeStatusRequest } from '../models/service-type.model';

@Injectable({
  providedIn: 'root',
})
export class PartnerService {
  private apiUrl = `${environment.apiUrl}/cordinator/partners`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách đối tác có phân trang và bộ lọc
   * Tương ứng với: GET /cordinator/partners
   */
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

  /**
   * Lấy chi tiết một đối tác
   * Tương ứng với: GET /cordinator/partners/{id}
   */
  getPartnerDetail(id: number): Observable<ApiResponse<PartnerDetail>> {
    return this.http.get<ApiResponse<PartnerDetail>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Thêm mới một đối tác
   * Tương ứng với: POST /cordinator/partners
   */
  addPartner(
    request: PartnerUpdateRequest
  ): Observable<ApiResponse<PartnerDetail>> {
    return this.http.post<ApiResponse<PartnerDetail>>(this.apiUrl, request);
  }

  /**
   * Cập nhật thông tin một đối tác
   * Tương ứng với: PUT /cordinator/partners/{id}
   */
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
   * === HÀM MỚI ===
   * Thay đổi trạng thái (kích hoạt/vô hiệu hóa) của đối tác
   * Tương ứng với: PATCH /cordinator/partners/{id}/status (Giả định)
   */
  changePartnerStatus(
    id: number,
    request: ChangeStatusRequest
  ): Observable<ApiResponse<PartnerSummary>> {
    // Lưu ý: Endpoint này được giả định dựa trên cấu trúc của ServiceTypeController.
    // Cần xác nhận lại với đội Backend. Nếu không có, có thể cần dùng hàm updatePartner.
    return this.http.patch<ApiResponse<PartnerSummary>>(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }
}
