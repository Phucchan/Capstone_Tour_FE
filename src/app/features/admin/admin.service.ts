import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Sử dụng đường dẫn tương đối để đảm bảo không có lỗi
import { ApiResponse } from '../../core/models/api-response.model';
import { PagingDTO } from '../../core/models/paging.model';
import {
  ChangeStatusRequest,
  UserFullInformation,
  UserManagementRequest,
} from './models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getCustomers(
    page: number,
    size: number,
    keyword?: string
  ): Observable<ApiResponse<PagingDTO<UserFullInformation>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<ApiResponse<PagingDTO<UserFullInformation>>>(
      `${this.baseUrl}/users/customers`,
      { params }
    );
  }

  getStaff(
    page: number,
    size: number,
    keyword?: string
  ): Observable<ApiResponse<PagingDTO<UserFullInformation>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<ApiResponse<PagingDTO<UserFullInformation>>>(
      `${this.baseUrl}/users/staffs`,
      { params }
    );
  }

  createStaff(payload: UserManagementRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/users`, payload);
  }

  changeUserStatus(
    id: number,
    payload: ChangeStatusRequest
  ): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.baseUrl}/users/${id}/status`,
      payload
    );
  }
}
