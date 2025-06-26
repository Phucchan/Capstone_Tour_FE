import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListTourService {
  constructor(private http: HttpClient) { }

  getTours(params: { page: number; size: number; sort?: string }): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/tours/fixed`, { params });
  }
}

