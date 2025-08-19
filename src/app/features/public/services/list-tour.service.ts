import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListTourService {
  constructor(private http: HttpClient) { }


  getFilteredTours(params: {
    destId: number;
    priceMin?: number;
    priceMax?: number;
    departId?: number;
    date?: string;
    page: number;
    size: number;
    name?: string;
    sortField?: string;
    sortDirection?: string;
  }): Observable<any> {
    const { destId, ...query } = params;
    const cleanQuery = this.removeUndefined(query);
    return this.http.get<any>(
      `${environment.apiUrl}/public/tours/destinations/${destId}/search`,
      { params: cleanQuery }
    );
  }
 

  getDiscountTours(page = 0, size = 12, sort?: string, name?: string): Observable<any> {
  const params: any = {
    page,
    size,
  };

  // Thêm sort nếu có
  if (sort) {
    if (sort === 'price_asc' || sort === 'price_desc') {
      params.sortField = 'startingPrice';
      params.sortDirection = sort === 'price_asc' ? 'asc' : 'desc';
    } else if (sort === 'latest') {
      params.sortField = 'createdAt';
      params.sortDirection = 'desc';
    }
  }

  return this.http.get<any>(`${environment.apiUrl}/public/tours/discounts`, { params });
}




  getDepartLocations(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/depart-locations`);
  }

  getDestinations(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/destinations`);
  }
  private removeUndefined(obj: any): any {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null));
  }
}

