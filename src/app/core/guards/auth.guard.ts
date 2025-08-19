import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { UserStorageService } from '../services/user-storage/user-storage.service';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private userStorageService: UserStorageService,
    private router: Router,
    @Inject(PLATFORM_ID) private pid: Object,
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {

    // ✅ Trên server (SSR): đừng chặn. Có 2 lựa chọn:
    // 1) Cho qua để prerender không treo:
    if (isPlatformServer(this.pid)) return true;

    // 2) Hoặc điều hướng về trang public (nếu bạn muốn tuyệt đối không render trang private trên SSR):
    // if (isPlatformServer(this.pid)) return this.router.parseUrl('/homepage');

    // ✅ Dưới browser mới kiểm tra thật
    if (!isPlatformBrowser(this.pid)) return true;

    const token = await this.userStorageService.getTokenAsync();
    if (!token || token.trim() === '') {
      // Điều hướng login chỉ nên chạy trên browser
      return this.router.createUrlTree(['/login']);
    }

    const userRoles = this.userStorageService.getUserRoles();

    // Master key cho ADMIN (demo)
    if (Array.isArray(userRoles) && userRoles.includes('ADMIN')) {
      return true;
    }

    const expectedRoles: string[] = route.data['expectedRoles'] || [];
    if (expectedRoles.length === 0) return true;

    const hasRequiredRole =
      Array.isArray(userRoles) &&
      expectedRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return this.router.createUrlTree(['/error/403-unauthorized']);
    }

    return true;
  }
}
