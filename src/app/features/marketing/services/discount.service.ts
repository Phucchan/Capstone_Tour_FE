// src/app/core/services/discount.service.ts

import { Injectable, inject } from '@angular/core'; 
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';


// ===== Models (đơn giản hóa theo swagger bạn cung cấp) ===== 
export interface ApiResponse<T> { 
  status: number; 
  code: number | string; 
  message: string; 
  data: T; 
} 

export interface Paged<T> { 
  page: number; 
  size: number; 
  total: number; 
  items: T[]; 
} 

export interface TourDiscountListItem { 
  id: number; // tourId 
  code: string; 
  name: string; 
  thumbnailImage?: string; 
  durationDays?: number; 
  typeName?: string; 
  tourStatus?: string; 
  hasDiscount?: boolean; // server có thể trả hoặc bạn map thêm 
  createdAt?: string; 
  createdByName?: string; 
} 

export interface ScheduleItem { 
  id: number; // scheduleId 
  coordinatorId?: number; 
  tourProductId?: number; 
  departureDate: string; 
  endDate: string; 
  price?: number; 
  discountId?: number | null; 
  discountPercent?: number | null; 
} 

export interface DiscountUpsertPayload { 
  scheduleId: number; 
  discountPercent: number; 
  startDate: string; // ISO 
  endDate: string;   // ISO 
} 

@Injectable({ providedIn: 'root' }) 
export class DiscountService { 
  private http = inject(HttpClient); 
  private base = environment.apiUrl;  

  // GET /marketing/discounts/tours 
  getDiscountTours(params: {
    page: number; size: number; keyword?: string; hasDiscount?: boolean | null;
  }): Observable<ApiResponse<Paged<TourDiscountListItem>>> { 
    let httpParams = new HttpParams() 
      .set('page', params.page) 
      .set('size', params.size); 
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword); 
    if (params.hasDiscount !== null && params.hasDiscount !== undefined) {
      httpParams = httpParams.set('hasDiscount', params.hasDiscount); 
    }
    return this.http.get<ApiResponse<Paged<TourDiscountListItem>>>( 
      `${this.base}/marketing/discounts/tours`, { params: httpParams } 
    ); 
  }

  // GET /marketing/discounts/tours/{tourId}/schedules 
  getSchedules(tourId: number) { // change: trả về ApiResponse<ScheduleItem[]>
    return this.http.get<ApiResponse<any[]>>(
      `${this.base}/marketing/discounts/tours/${tourId}/schedules`
    )
    .pipe(
      map(res => {
        const raw = Array.isArray(res.data) ? res.data : [];
        const data: ScheduleItem[] = raw.map((x: any) => ({
          id: Number(x.id),
          coordinatorId: x.coordinatorId ?? undefined,
          tourProductId: x.tourProductId ?? undefined,
          // change: chống sai key từ BE
          departureDate: x.departureDate || x.departDate || x.startDate || x.departure_time,
          endDate: x.endDate || x.finishDate || x.end_time,
          price: x.price ?? undefined,
          discountId: (x.discountId ?? null),
          discountPercent: (x.discountPercent ?? null),
        }));
        return { ...res, data } as ApiResponse<ScheduleItem[]>;
      })
    ); // change
  }
  // POST /marketing/discounts 
  createDiscount(payload: DiscountUpsertPayload): Observable<ApiResponse<any>> { 
    return this.http.post<ApiResponse<any>>( 
      `${this.base}/marketing/discounts`, payload 
    ); 
  }

  // PUT /marketing/discounts/{id} 
  updateDiscount(id: number, payload: DiscountUpsertPayload): Observable<ApiResponse<any>> { 
    return this.http.put<ApiResponse<any>>( 
      `${this.base}/marketing/discounts/${id}`, payload 
    ); 
  }

  // DELETE /marketing/discounts/{id} 
  deleteDiscount(id: number): Observable<ApiResponse<any>> { 
    return this.http.delete<ApiResponse<any>>( 
      `${this.base}/marketing/discounts/${id}` 
    ); 
  }
}
