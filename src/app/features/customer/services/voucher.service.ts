// src/app/features/customer/services/voucher.service.ts
// change
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface VoucherQuery {
  page?: number;
  size?: number;
  keyword?: string;
}

@Injectable({ providedIn: 'root' })
export class VoucherService {
  constructor(private http: HttpClient) {}

  /** Danh sách voucher công khai (có phân trang + keyword) */
  // change
  getVouchers(query: VoucherQuery): Observable<any> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.size !== undefined) params = params.set('size', String(query.size));
    if (query.keyword) params = params.set('keyword', query.keyword.trim());

    return this.http.get<any>(`${environment.apiUrl}/customer/vouchers`, { params });
  }

  /** Redeem voucher cho user */
  // change
  redeemVoucher(userId: number, voucherId: number): Observable<any> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.post<any>(`${environment.apiUrl}/customer/vouchers/${voucherId}/redeem`, {}, { params });
  }

  /** Danh sách voucher của user (API trả mảng, không phân trang theo hình swagger) */
  // change
  getUserVouchers(userId: number): Observable<any[]> {
  return this.http
    .get<any>(`${environment.apiUrl}/customer/vouchers/userVoucher/${userId}`)
    .pipe(
      map((res: any) => Array.isArray(res) ? res : (res?.data ?? []))
    );
}
}
