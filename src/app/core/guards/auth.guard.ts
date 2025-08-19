import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { UserStorageService } from '../services/user-storage/user-storage.service';
import { SsrService } from '../services/ssr.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private userStorageService: UserStorageService,
    private router: Router,
    private ssrService: SsrService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (!this.ssrService.isBrowser) {
      return false;
    }

    const token = await this.userStorageService.getTokenAsync();
    if (!token || token.trim() === '') {
      return this.router.createUrlTree(['/login']);
    }

    const userRoles = this.userStorageService.getUserRoles();

    // ======================================================
    // === LOGIC "MASTER KEY" CHO ADMIN ===
    // ======================================================
    // Nếu người dùng có vai trò 'ADMIN', luôn cho phép truy cập.
    // Điều này phục vụ cho mục đích demo, giúp Admin có thể vào mọi trang.
    if (Array.isArray(userRoles) && userRoles.includes('ADMIN')) {
      return true;
    }

    // --- Logic phân quyền gốc cho các vai trò khác ---
    const expectedRoles: string[] = route.data['expectedRoles'] || [];
    if (expectedRoles.length === 0) {
      return true; // Nếu route không yêu cầu quyền, cho phép truy cập
    }

    const hasRequiredRole =
      Array.isArray(userRoles) &&
      expectedRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      // Nếu không có quyền, chuyển hướng đến trang không được phép
      return this.router.createUrlTree(['/error/403-unauthorized']);
    }

    return true;
  }
}
