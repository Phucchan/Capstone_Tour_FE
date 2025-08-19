import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PartnerServiceShortDTO } from '../models/tour.model';

@Injectable({
  providedIn: 'root',
})
export class PartnerServiceService {
  private baseApiUrl = `${environment.apiUrl}/business`;
  private http = inject(HttpClient);

  /**
   * Lấy danh sách TẤT CẢ các dịch vụ từ đối tác để hiển thị trong dropdown
   */
  getPartnerServices(): Observable<PartnerServiceShortDTO[]> {
    return this.http
      .get<ApiResponse<PartnerServiceShortDTO[]>>(
        `${this.baseApiUrl}/partner-services`
      )
      .pipe(map((res) => res.data));
  }

  /**
   * Lấy các dịch vụ của đối tác theo loại dịch vụ.
   * Giúp khắc phục lỗi Race Condition.
   * @param serviceTypeName Tên của loại dịch vụ (ví dụ: "Khách sạn")
   */
  getPartnerServicesByType(
    serviceTypeId: number
  ): Observable<PartnerServiceShortDTO[]> {
    const params = new HttpParams().set(
      'serviceTypeId',
      serviceTypeId.toString()
    );
    return this.http
      .get<ApiResponse<PartnerServiceShortDTO[]>>(
        `${this.baseApiUrl}/partner-services`,
        { params }
      )
      .pipe(map((response) => response.data));
  }
}
