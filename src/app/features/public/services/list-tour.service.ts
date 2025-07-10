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
    priceMin?: number;
    priceMax?: number;
    departId?: number;
    destId?: number;
    date?: string;
    page: number;
    size: number;
    sortField?: string;       // Thêm dòng này
    sortDirection?: string;   // Thêm dòng này
  }): Observable<any> {
    const cleanParams = this.removeUndefined(params);
    return this.http.get<any>(`${environment.apiUrl}/public/tours/search`, { params: cleanParams });
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

