import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestBookingService {
  constructor(private http: HttpClient) {}

  getDestinations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/public/locations/destinations`);
  }

  getDepartures(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/public/locations/departures`);
  }

  getThemes(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/customer/request-bookings/themes`);
  }
  
  getCustomerRequestBookings(userId: number, params?: { page?: number; size?: number; search?: string }) {
    const httpParams: any = {};
    if (params?.page !== undefined) httpParams.page = params.page;
    if (params?.size !== undefined) httpParams.size = params.size;
    if (params?.search) httpParams.search = params.search;

    return this.http.get<any>(
      `${environment.apiUrl}/customer/${userId}/request-bookings`, {
         params: httpParams });
  }
  sendVerifyCode(email: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/customer/request-bookings/send-code`, null, 
      { params: { email } });
  }

 requestBooking(body: any, userId: number) {
  return this.http.post<ApiResp>(
    `${environment.apiUrl}/customer/request-bookings`,
    body,
    { params: { userId } }
  ).pipe(
    // CHANGE: chuẩn hoá ok/nghiệp vụ
    map(res => {
      const ok = res && (res.status === 0 || res.status === 200 || res.status === undefined);
      if (!ok) {
        // ném lỗi để rơi vào error của subscribe
        throw new HttpErrorResponse({
          status: res.status ?? 400,
          error: { message: res.message || 'Yêu cầu không hợp lệ' }
        });
      }
      return res; // hoặc return res.data nếu bạn chỉ cần data
    })
  );
}
}
export interface ApiResp<T=any> {
  status?: number;  // 0 | 200 = OK, 400... = lỗi nghiệp vụ
  code?: number;
  message?: string;
  data?: T;
}