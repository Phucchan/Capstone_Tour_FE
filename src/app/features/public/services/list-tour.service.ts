import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListTourService {
  constructor(private http: HttpClient) {}

  getTourList(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/tours/fixed?page=${page}&size=${size}`);
  }
}