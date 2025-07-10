import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { catchError, of } from 'rxjs';
import { UserStorageService } from '../../services/user-storage/user-storage.service';
import { CommonModule } from '@angular/common';
import { SsrService } from '../../services/ssr.service';
import { SocketSerivce } from '../../services/socket/socket.service';
import { environment } from '../../../../environments/environment';
import { CurrentUserService } from '../../services/user-storage/current-user.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  errorMessage: string | null = null;
  passwordCriteria = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
  };

  usernameCriteria = {
    minLength: false,
    maxLength: false,
  };

  activeUsersSubcription: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private userStorageService: UserStorageService,
    private ssrService: SsrService,
    private route: ActivatedRoute,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit() {
    const rememberedUsername = this.ssrService
      .getLocalStorage()
      ?.getItem('rememberedUser')
      ?.replaceAll('"', '');

    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const email = params['email'];
      if (token) {
        this.postLogin(token, { username: email, password: null });
      }
    });

    // Initialize the login form
    this.loginForm = this.formBuilder.group({
      username: [
        rememberedUsername || null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
        ],
      ],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).*$'),
        ],
      ],
    });

    // Username validation criteria
    this.loginForm.get('username')?.valueChanges.subscribe((value) => {
      this.usernameCriteria.minLength = value.length >= 8;
      this.usernameCriteria.maxLength = value.length <= 30;
    });

    // Listen to password changes for validation criteria
    this.loginForm.get('password')?.valueChanges.subscribe((value) => {
      this.validatePasswordCriteria(value);
    });
  }

  // Validate password criteria
  validatePasswordCriteria(password: string): void {
    this.passwordCriteria.minLength = password.length >= 8;
    this.passwordCriteria.uppercase = /[A-Z]/.test(password);
    this.passwordCriteria.lowercase = /[a-z]/.test(password);
    this.passwordCriteria.specialChar = /[\W_]/.test(password);
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  loginSocial(provider: string) {
    const providerId = provider.toLowerCase();
    const oauthUrl = `${environment.apiUrl}/oauth2/authorization/${providerId}`;
    window.location.href = oauthUrl;
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService
      .login(username, password)
      .pipe(
        catchError((error) => {
          this.errorMessage =
            error.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
          return of(null);
        })
      )
      .subscribe((user: any) => {
        if (user) {
          // Logic rememberMe
          const rememberMe = (
            document.getElementById('remember-me') as HTMLInputElement
          ).checked;
          if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
          } else {
            localStorage.removeItem('rememberedUser');
          }

          // Điều hướng sau khi đăng nhập thành công
          this.navigateAfterLogin(user);
        }
      });
  }

  navigateAfterLogin(user: any) {
    // Lấy roles trực tiếp từ đối tượng user vừa nhận được
    const userRoles = user.roles?.map((roleObj: any) => roleObj.roleName) || [];

    const roleRouteMap: { [key: string]: string } = {
      CUSTOMER: 'customer',
      ADMIN: 'admin',
      BUSINESS_DEPARTMENT: 'business/tours', // <-- Đảm bảo điều hướng đúng
      // ... các role khác
    };

    let redirectTo = '/';
    if (userRoles.includes('ADMIN')) {
      redirectTo = `/${roleRouteMap['ADMIN']}`;
    } else if (userRoles.includes('BUSINESS_DEPARTMENT')) {
      redirectTo = `/${roleRouteMap['BUSINESS_DEPARTMENT']}`;
    } else if (userRoles.length > 0) {
      const targetRole =
        userRoles.find((role: string) => role !== 'CUSTOMER') || userRoles[0];
      redirectTo = `/${roleRouteMap[targetRole] || 'customer'}`;
    }

    this.router.navigate([redirectTo]);
  }

  // Hàm postLogin không còn cần thiết cho luồng đăng nhập bằng form nữa,
  // nhưng vẫn giữ lại để xử lý login qua social
  postLogin(token: string, user: any) {
    this.userStorageService.saveToken(token);
    this.currentUserService.setCurrentUser({ ...user, accessToken: token });
    this.navigateAfterLogin(user);
  }
}
