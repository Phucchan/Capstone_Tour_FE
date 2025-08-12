import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestBookingService {
  constructor(private http: HttpClient) {}

  getDestinations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/public/locations/destinations`);
  }

  getDepartures(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/public/locations/departures`);
  }

  getThemes(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/customer/request-bookings/themes`);
  }
  
  getCustomerRequestBookings(userId: number, params?: { page?: number; size?: number; search?: string }) {
    const httpParams: any = {};
    if (params?.page !== undefined) httpParams.page = params.page;
    if (params?.size !== undefined) httpParams.size = params.size;
    if (params?.search) httpParams.search = params.search;

    return this.http.get<any>(`${environment.apiUrl}/customer/${userId}/request-bookings`, { params: httpParams });
  }

 requestBooking(body: any, userId: number) {
  return this.http.post(
    `${environment.apiUrl}/customer/request-bookings`,
    body,
    { params: { userId } }          
  );
}
}
