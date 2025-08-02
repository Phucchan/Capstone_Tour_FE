import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  constructor(private http: HttpClient) {}

  addToWishlist(userId: number, tourId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/public/users/${userId}/wishlists/${tourId}`, {});
  }

  getWishlist(userId: number): Observable<any> {
  return this.http.get(`${environment.apiUrl}/public/users/${userId}/wishlists`);
}

removeFromWishlist(userId: number, tourId: number): Observable<any> {
  return this.http.delete(`${environment.apiUrl}/public/users/${userId}/wishlists/${tourId}`);
}
}
