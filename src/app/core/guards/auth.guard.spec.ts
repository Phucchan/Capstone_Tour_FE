import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { UserStorageService } from '../services/user-storage/user-storage.service';
import { Observable, of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter = { navigate: jasmine.createSpy('navigate') };
  let mockUserStorageService = { getTokenAsync: (): Observable<string | null> => of('mockToken') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: UserStorageService, useValue: mockUserStorageService }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if token exists', (done) => {
    const mockRoute: any = { data: {} };
    const mockState: any = { url: '/' };
    (guard.canActivate as any)(mockRoute, mockState).then((result: any) => {
      expect(result).toBeTrue();
      done();
    });
    it('should redirect to login if no token', (done) => {
      mockUserStorageService.getTokenAsync = (): Observable<string | null> => of(null);

      const mockRoute: any = { data: {} };
      const mockState: any = { url: '/' };

      (guard.canActivate as any)(mockRoute, mockState).then((result: any) => {
        // Since your guard returns a UrlTree for redirect, check for that
        expect(result.toString()).toContain('/login');
        done();
      });
    });
  });
});
