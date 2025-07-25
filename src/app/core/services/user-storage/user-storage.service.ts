import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { SsrService } from '../ssr.service';

const TOKEN = 'token';
const USER = 'user';

@Injectable({
  providedIn: 'root',
})
export class UserStorageService {

  constructor(
    private ssrService: SsrService
  ) {
  }

  public setCookie(name: string, value: string, days?: number): void {
    if (typeof document === 'undefined') {
      // Không chạy trong trình duyệt — không làm gì cả
      return;
    }
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = `${name}=${value}${expires}; path=/`;
  }

  private getCookie(name: string): string | null {
    if (!this.ssrService.isBrowser) return null;
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  public deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=-99999999; path=/`;
  }

  public saveToken(token: string): void {
    this.setCookie(TOKEN, token, 1);
  }

  public saveTokenRemembered(token: string): void {
    this.setCookie(TOKEN, token, 30);
  }

  public saveUser(user: any): void {
    console.log('{UserStorageService}  Saving user:', user);
    this.setCookie(
      USER,
      JSON.stringify({
        username: user.username,
        id: user.id,
        role: this.getUserRoles(),
      }),
      1
    );
  }

  public saveUserRemembered(user: any): void {
    this.setCookie(
      USER,
      JSON.stringify({
        username: user.username,
        id: this.getUserId(),
        role: this.getUserRoles(),
      }),
      30
    );
  }

  getUserRoles(): string[] {
    const decodedToken = this.decodeToken();
    return decodedToken ? decodedToken.roles || [] : [];
  }

  // getUserId(): number | null {
  //   const decodedToken = this.decodeToken();
  //   return decodedToken ? decodedToken.id || null : null;
  // }
  getUserId(): number | null {
    const user = this.getUser();
    return user && user.id ? Number(user.id) : null;
  }

  decodeToken(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  public getToken(): string | null {
    const document = this.ssrService.getDocument();
    if (document) {
      return this.getCookie(TOKEN);
    }
    return null;
  }

  public getTokenAsync(): Promise<string | null> {
    const document = this.ssrService.getDocument();
    if (document) {
      return Promise.resolve(this.getToken());
    }
    return Promise.resolve(null);
  }

  public getUser(): any {
    const userJson = this.getCookie(USER);
    console.log('DEBUG - user in getUserId:', userJson);
    return userJson ? JSON.parse(userJson) : null;
  }

  public getUserRole(): string {
    const user = this.getUser();
    return user?.roles || '';
  }

  static signOut(userStorageService: UserStorageService): void {
    userStorageService.deleteCookie(TOKEN);
    userStorageService.deleteCookie(USER);
  }


  public logout() {
    this.deleteCookie(TOKEN);
    this.deleteCookie(USER);
  }

}
