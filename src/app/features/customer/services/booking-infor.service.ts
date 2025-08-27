import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
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
    return this.http.post<any>(`${environment.apiUrl}/public/booking/submit`, bookingData).pipe(
    // CHANGE: chuẩn hoá ok/nghiệp vụ
    map(res => {
      const ok = res && (res.status === 0 || res.status === 200 || res.status === undefined);
      if (!ok) {
        // ném lỗi để rơi vào error của subscribe
        throw new HttpErrorResponse({
          status: res.status ?? 400,
          error: { message: res.message || 'Yêu cầu không hợp lệ' }
        });
      }
      return res; // hoặc return res.data nếu bạn chỉ cần data
    })
  );
}

  sendVerifyCode(email: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/public/booking/send-code`,
      null,
      { params: { email } }
    );
  }
  getBookingDetails(bookingId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/booking/details/${bookingId}`);
  }

  public getUserInformation(userId: number): Observable<any> {
    return this.http.get<any[]>(`${environment.apiUrl}/public/booking/details/user/${userId}`);
  }

  
  changePaymentMethod(bookingCode: string, method: 'CASH' | 'BANKING'): Observable<any> {
  return this.http.post<any>(
    `${environment.apiUrl}/public/booking/change-payment-method`,
    null, // body phải là null vì swagger nhận query, không nhận body
    {
      params: {
        bookingCode,                // ?bookingCode=...
        paymentMethod: method       // &paymentMethod=CASH|BANKING
      }
    }
  );
}


}

export interface ApiResp<T=any> {
  status?: number;  // 0 | 200 = OK, 400... = lỗi nghiệp vụ
  code?: number;
  message?: string;
  data?: T;
}