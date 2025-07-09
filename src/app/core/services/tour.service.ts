import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TourListItem, PagingDTO } from '../models/tour.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private apiUrl = `${environment.apiUrl}/business/tours`;

  constructor(private http: HttpClient) {}

  getTours(filters: {
    page: number;
    size: number;
    keyword?: string | null;
    tourType?: string | null;
    tourStatus?: string | null;
  }): Observable<PagingDTO<TourListItem>> {
    let params = new HttpParams()
      .set('page', filters.page.toString())
      .set('size', filters.size.toString());

    if (filters.keyword) params = params.set('keyword', filters.keyword);
    if (filters.tourType) params = params.set('tourType', filters.tourType);
    if (filters.tourStatus)
      params = params.set('tourStatus', filters.tourStatus);

    return this.http
      .get<ApiResponse<PagingDTO<TourListItem>>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }
}
