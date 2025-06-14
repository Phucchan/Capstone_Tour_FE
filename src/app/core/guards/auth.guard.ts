import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserStorageService } from '../services/user-storage/user-storage.service';
import { SsrService } from '../services/ssr.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private userStorageService: UserStorageService,
    private router: Router,
    private ssrService: SsrService,
  ) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const isBrowser = this.ssrService.isBrowser;
    if (isBrowser) {
      const token = await this.userStorageService.getTokenAsync();

      if (!token || token.trim() === '') {
        return this.router.createUrlTree(['/login']);
      }

      const expectedRoles: string[] = route.data['expectedRoles'] || [];

      if (expectedRoles.length === 0) {
        return true;
      }
      const userRoles = this.userStorageService.getUserRoles();

      const hasRequiredRole = Array.isArray(userRoles) && (
        expectedRoles.some(role => userRoles.includes(role))
      );      

      if (!hasRequiredRole) {
        return this.router.createUrlTree(['/error/403-unauthorized']);
      }

      return true;
    }

    return false;
  }
}


