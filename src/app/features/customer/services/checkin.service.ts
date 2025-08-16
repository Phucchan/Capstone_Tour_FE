// src/app/core/services/checkin.service.ts
// Service gọi API Check-in cho khách hàng đã hoàn thành tour.

import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface Page<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number; // 0-based
  size: number;
}

// ---- Danh sách booking (tour đã hoàn thành, đủ điều kiện check-in)
export interface CheckinBooking {
  id: number;              // id của record checkin? (theo mẫu là 'id')
  tourId: number;          // 'tourId' (mặc dù mẫu là 'tourId' viết thường)
  bookingCode: string;
  tourName: string;
  status: string;          // trạng thái booking
  totalAmount: number;
  createdAt: string;       // ISO string
  departureDate: string;   // ISO string
  hasRefundInfo: boolean;
}

// ---- Ảnh check-in một booking
export interface CheckinPhoto {
  id: number;
  imageUrl: string;
  createdAt: string;
  pointsEarned: number; // theo swagger
}

@Injectable({ providedIn: 'root' })
export class CheckinService {

  constructor(private http: HttpClient) {}

  /**
   * GET /customer/{userId}/checkin
   * Lấy các booking đã hoàn thành (có thể check-in / up ảnh).
   */
  getCheckinBookings(userId: number, params?: {page?: number; size?: number; name?: string; departureDate?: string}): Observable<ApiResponse<CheckinBooking[]>> {
    // KHÔNG có /public theo swagger bạn gửi
    return this.http.get<ApiResponse<CheckinBooking[]>>(
      `${environment.apiUrl}/customer/${userId}/checkin`,
      { params: params as any }
    );
  }

  // Lấy ảnh check-in của 1 booking
  getPhotos(userId: number, bookingId: number): Observable<ApiResponse<CheckinPhoto[]>> {
    return this.http.get<ApiResponse<CheckinPhoto[]>>(
      `${environment.apiUrl}/customer/${userId}/checkin/${bookingId}/photos`
    );
  }

  // Upload 1 ảnh (multipart) — trả về stream để hiển thị progress (giống pattern Angular chuẩn)
  uploadPhoto(
    userId: number,
    bookingId: number,
    file: File
  ): Observable<HttpEvent<ApiResponse<CheckinPhoto>>> {
    const form = new FormData();
    form.append('file', file); // backend yêu cầu key 'file'
    return this.http.post<ApiResponse<CheckinPhoto>>(
      `${environment.apiUrl}/customer/${userId}/checkin/${bookingId}/photos`,
      form,
      { observe: 'events', reportProgress: true }
    );
  }

  // Xóa 1 ảnh theo checkInId
  deletePhoto(userId: number, checkInId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${environment.apiUrl}/customer/${userId}/checkin/photos/${checkInId}`
    );
  }

  // Helpers (tuỳ chọn dùng ở component)
  extractProgress = (e: HttpEvent<unknown>) =>
    e.type === HttpEventType.UploadProgress && e.total
      ? Math.round((e.loaded * 100) / e.total)
      : null;

  extractResponse = () =>
    (source: Observable<HttpEvent<ApiResponse<any>>>) =>
      source.pipe(
        filter(e => e.type === HttpEventType.Response),
        map((e: any) => e.body as ApiResponse<any>)
      );
}


