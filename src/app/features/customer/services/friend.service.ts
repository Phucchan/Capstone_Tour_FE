import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, tap } from "rxjs";
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private friends: any[] | null = null;

  constructor(private http: HttpClient) {}

  getFriends(userId: number): Observable<any[]> {
    if (this.friends) {
      return of(this.friends); // Trả về từ cache
    } else {
      return this.http.get<any[]>(`${environment.apiUrl}/public/users/friends/${userId}`).pipe(
        tap((fetched) => this.friends = fetched) // Cache lại
      );
    }
  }

  clearCache() {
    this.friends = null;
  }
}
