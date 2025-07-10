import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingInfoService {
  private tourDetails?: any;
  private tourSchedule?: any;
  private bookingId?: number;

  constructor(private http: HttpClient) { }

  setTourDetails(tourDetails: any) {
    this.tourDetails = tourDetails;
    localStorage.setItem('tourDetails', JSON.stringify(tourDetails))
  }

  setTourSchedule(tourSchedule?: any) {
    this.tourSchedule = tourSchedule
    localStorage.setItem('tourSchedule', JSON.stringify(tourSchedule))
  }


  setBookingId(bookingId: number) {
    this.bookingId = bookingId;
    
  }

  getBookingId() {
    return this.bookingId;
  }
  
  getTourDetails() {
    return this.tourDetails || JSON.parse(localStorage.getItem('tourDetails') || '{}');
  }

  getTourSchedule() {
    return this.tourSchedule || JSON.parse(localStorage.getItem('tourSchedule') || '{}');
  }


  submitBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/public/booking/submit`, bookingData);
  }


  getBookingDetails(bookingId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/booking/details/${bookingId}`);
  }

  public getUserInformation(userId: number): Observable<any> {
    return this.http.get<any[]>(`${environment.apiUrl}/public/booking/details/user/${userId}`);
  }

  
  changePaymentStatus(bookingId: number, method: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/public/booking/change-payment-method`, {
      bookingId: bookingId,
      paymentMethod: method
    });

  }


}