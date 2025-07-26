import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  MonthlyNewUser,
  TourRevenue,
} from '../../../core/models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/business/revenue`;

  private createParams(startDate?: string, endDate?: string): HttpParams {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    return params;
  }


  getTotalRevenue(
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<number>> {
    const params = this.createParams(startDate, endDate);
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/total-revenue`, {
      params,
    });
  }

  getTotalBookings(
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<number>> {
    const params = this.createParams(startDate, endDate);
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/total-bookings`, {
      params,
    });
  }

  getTotalNewUsers(
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<number>> {
    const params = this.createParams(startDate, endDate);
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/total-new-users`,
      { params }
    );
  }

  getMonthlyNewUsers(
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<MonthlyNewUser[]>> {
    let params = this.createParams(startDate, endDate);
    params = params.append('year', new Date().getFullYear());
    return this.http.get<ApiResponse<MonthlyNewUser[]>>(
      `${this.apiUrl}/users/monthly`,
      { params }
    );
  }

  getTopToursByRevenue(
    limit: number = 5,
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<TourRevenue[]>> {
    let params = this.createParams(startDate, endDate);
    params = params.append('limit', limit.toString());
    return this.http.get<ApiResponse<TourRevenue[]>>(
      `${this.apiUrl}/top-tours`,
      { params }
    );
  }
}
