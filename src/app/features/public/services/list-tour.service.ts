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


  // getDepartLocations(): Observable<any> {
  //   return this.http.get<any>(`${environment.apiUrl}/public/depart-locations`);
  // }

  // getDestinations(): Observable<any> {
  //   return this.http.get<any>(`${environment.apiUrl}/public/destinations`);
  // }
  private removeUndefined(obj: any): any {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null));
  }
}

