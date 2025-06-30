import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule]
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage: string = '';
  hidePassword = true;
  activeField: string | null = null;
  confirmPasswordMismatch = false;

  // Các tiêu chí để hiển thị popup
  usernameCriteria = {
    minLength: false,
    maxLength: false,
    pattern: false
  };
  passwordCriteria = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    specialChar: false
  };
  emailCriteria = { validFormat: false };
  fullNameCriteria = { pattern: false };
  phoneCriteria = { validFormat: false };
  addressCriteria = { validFormat: false };
  gendersCriteria = { validFormat: false };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ỹ\s]+$/)]],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
      address: ['', [Validators.required]],
      avatarImg: ['https://cdn-icons-png.flaticon.com/512/149/149071.png'], // default avatar
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+$/)
      ]],
      rePassword: ['', Validators.required]
    });
  }

  onFocus(field: string): void {
    this.activeField = field;
    const val = this.signupForm.get(field)?.value || '';

    if (field === 'username') {
      this.usernameCriteria.minLength = val.length >= 8;
      this.usernameCriteria.maxLength = val.length <= 30;
      this.usernameCriteria.pattern = /^[a-zA-Z0-9]+$/.test(val);
    }

    if (field === 'email') {
      this.emailCriteria.validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    if (field === 'fullName') {
      this.fullNameCriteria.pattern = /^[a-zA-ZÀ-ỹ\s]+$/.test(val);
    }

    if (field === 'phone') {
      this.phoneCriteria.validFormat = /^[0-9]{9,11}$/.test(val);
    }

    if (field === 'address') {
      this.addressCriteria.validFormat = val.trim().length > 0;
    }

    if (field === 'gender') {
      this.gendersCriteria.validFormat = val === 'MALE' || val === 'FEMALE';
    }

    if (field === 'password') {
      this.passwordCriteria.minLength = val.length >= 8;
      this.passwordCriteria.uppercase = /[A-Z]/.test(val);
      this.passwordCriteria.lowercase = /[a-z]/.test(val);
      this.passwordCriteria.specialChar = /\W/.test(val);
    }

    if (field === 'rePassword') {
      const password = this.signupForm.get('password')?.value;
      this.confirmPasswordMismatch = password !== val;
    }
  }

  onBlur(): void {
    this.activeField = null;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const formValue = this.signupForm.value;

    if (formValue.password !== formValue.rePassword) {
      this.confirmPasswordMismatch = true;
      return;
    }

    this.confirmPasswordMismatch = false;
    this.isLoading = true;

    const payload = {
      ...formValue,
      role: 'CUSTOMER'
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      }
    });
  }
}
