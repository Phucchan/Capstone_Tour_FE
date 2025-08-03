import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomOrderTourService {
  constructor(private http: HttpClient) {}

  getDestinations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/public/locations/destinations`);
  }

  getDepartures(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/public/locations/departures`);
  }

  requestBooking(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/request-bookings`, data);
  }
}
