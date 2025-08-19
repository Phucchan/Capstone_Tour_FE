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
          if (response.body && response.body.data) {
            const token = response.body.data.token;
            const userInfo = response.body.data.user;

            if (token && userInfo) {
              // 1. Lưu token ngay lập tức để UserStorageService có thể giải mã
              this.userStorageService.saveToken(token);

              // 2. Lấy vai trò (roles) từ token đã được giải mã
              const roles = this.userStorageService.getUserRoles();

              // 3. Tạo một đối tượng user hoàn chỉnh
              const userToStore = {
                ...userInfo, // Thông tin cơ bản (id, username, email...)
                roles: roles, // Gán mảng vai trò đã được giải mã
                accessToken: token,
              };

              // 4. Lưu user HOÀN CHỈNH vào cookie và cập nhật trạng thái
              this.userStorageService.saveUser(userToStore);
              this.currentUserService.setCurrentUser(userToStore);
            }
          }
        }),
        // Trả về toàn bộ body cho LoginComponent để xử lý redirectUrl
        map((response: any) => response.body)
      );
  }

  register(payload: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${environment.apiUrl}/auth/register`, payload, {
      headers,
    });
  }
}
