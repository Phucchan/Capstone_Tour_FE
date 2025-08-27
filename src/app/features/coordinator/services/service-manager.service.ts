// Vị trí: src/app/features/marketing/pages/service-manager/service-manager.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

// ==== Models (map đúng spec Swagger) ====
export interface ServiceItem { // change
  id: number;
  name: string;
  partnerId?: number;
  partnerName?: string;
  serviceTypeId?: number;
  serviceTypeName?: string;
  imageUrl?: string;
  description?: string;
  nettPrice?: number;
  sellingPrice?: number;
  costType?: 'FIXED' | 'VARIABLE' | string;
  status?:  'ACTIVE' | 'DEACTIVE' | string;
}

export interface PageResp<T> { // change
  page: number;
  size: number;
  total: number;
  items: T[];
}

export interface ServiceCreateRequest { // change
  name: string;
  serviceTypeId: number;
  partnerId: number;
  imageUrl?: string;
  description?: string;
  nettPrice: number;
  sellingPrice: number;
  costType: 'FIXED' | 'PER_PERSON';
}

@Injectable({ providedIn: 'root' })
export class CoordinatorServiceApi { // change
  private http = inject(HttpClient);
  private base = environment.apiUrl; // change

  search(page = 0, size = 10, keyword = ''): Observable<PageResp<ServiceItem>> { // change
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword?.trim()) params = params.set('keyword', keyword.trim());
    return this.http.get<any>(`${this.base}/coordinator/services`, { params }).pipe(
      map(res => ({
        page: res?.data?.page ?? page,
        size: res?.data?.size ?? size,
        total: res?.data?.total ?? 0,
        items: (res?.data?.items ?? []) as ServiceItem[]
      }))
    );
  }

  getById(id: number): Observable<ServiceItem> { // change
    return this.http.get<any>(`${this.base}/coordinator/services/${id}`).pipe(map(r => r?.data as ServiceItem));
  }

  create(body: ServiceCreateRequest): Observable<any> { // change
    return this.http.post<any>(`${this.base}/coordinator/services`, body);
  }

  update(id: number, body: ServiceCreateRequest): Observable<any> { // change
    // Nếu API không có PUT update chi tiết, có thể dùng POST /{id} tuỳ backend. Ở đây giả định PUT /{id}
    return this.http.put<any>(`${this.base}/coordinator/services/${id}`, body);
  }

  delete(id: number): Observable<any> { // change
    return this.http.delete<any>(`${this.base}/coordinator/services/${id}`);
  }

  updateStatus(id: number, status:  'ACTIVE' | 'DEACTIVE'): Observable<any> { // change
    const params = new HttpParams().set('status', status);
    return this.http.put<any>(`${this.base}/coordinator/services/${id}/status`, null, { params });
  }
}
