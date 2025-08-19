import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TourDetailService {
  constructor(private http: HttpClient) {}

  getTourDetail(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/tours/${id}`);
  }
  getPolicies(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/policies`);
  }
}
