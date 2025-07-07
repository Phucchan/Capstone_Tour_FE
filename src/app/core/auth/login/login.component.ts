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

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    const rememberMe = (
      document.getElementById('remember-me') as HTMLInputElement
    ).checked;

    this.authService
      .login(username, password)
      .pipe(
        catchError((error) => {
          const apiError = error || 'Đăng nhập thất bại. Vui lòng thử lại.';
          this.errorMessage = apiError;
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response !== null) {
          const token = response.body.data.token;
          const user = response.body.data.user;

          console.log('{LoginComponent} Login successful:', user);

          console.log('{LoginComponent} Remember Me:', rememberMe);

          if (rememberMe) {
            localStorage.setItem('rememberedUser', user);
          }

          this.postLogin(token, user);
        }
      });
  }

  postLogin(token: string, user: any) {
    this.userStorageService.saveToken(token);
    const userRoles = this.userStorageService.getUserRoles();
    console.log('User: ', user);
    console.log('Token: ', token);
    console.log('roles: ', userRoles);

    this.currentUserService.setCurrentUser(user);

    // Mapping role to route
    const roleRouteMap: { [key: string]: string } = {
      CUSTOMER: 'customer',
      ADMIN: 'admin',
      MARKETING_MANAGER: 'marketing-manager',
      SELLER: 'seller',
      BUSINESS_DEPARTMENT: 'business-department',
      SERVICE_COORDINATOR: 'service-coordinator',
      ACCOUNTANT: 'accountant',
    };

    let redirectTo = '/'; // Default nếu chỉ có role CUSTOMER
    if (userRoles.length > 1 || userRoles[0] !== 'CUSTOMER') {
      const targetRole =
        userRoles.find((role) => role !== 'CUSTOMER') || userRoles[0];
      redirectTo = `/${roleRouteMap[targetRole] || '/'}`;
    }
    console.log('Redirecting to:', redirectTo);
    this.router.navigate([redirectTo]);
  }
}
