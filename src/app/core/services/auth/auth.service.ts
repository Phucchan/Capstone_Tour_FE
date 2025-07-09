import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { UserStorageService } from '../user-storage/user-storage.service';
import { environment } from '../../../../environments/environment';
import { CurrentUserService } from '../user-storage/current-user.service';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private userStorageService: UserStorageService,
    private currentUserService: CurrentUserService
  ) {}

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { username, password };

    return this.http
      .post(environment.apiUrl + '/auth/login', body, {
        headers,
        observe: 'response',
      })
      .pipe(
        tap((response: any) => {
          const token = response.body.data.token;
          const userInfo = response.body.data.user;

          if (token && userInfo) {
            // === ĐÂY LÀ THAY ĐỔI QUAN TRỌNG NHẤT ===
            // 1. Tạo một đối tượng user hoàn chỉnh để lưu trữ
            const userToStore = {
              ...userInfo, // Lấy tất cả thông tin user (id, username, roles...)
              accessToken: token, // Thêm accessToken để Interceptor có thể tìm thấy
            };

            // 2. Service tự xử lý việc lưu trữ
            this.userStorageService.saveToken(token); // Lưu token riêng vào cookie 'token'
            this.userStorageService.saveUser(userToStore); // Lưu user hoàn chỉnh vào cookie 'user'
            this.currentUserService.setCurrentUser(userToStore); // Cập nhật trạng thái trong bộ nhớ
          }
        }),
        // Chỉ trả về thông tin user cho component
        map((response: any) => response.body.data.user)
      );
  }

  register(payload: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${environment.apiUrl}/auth/register`, payload, {
      headers,
    });
  }
}
