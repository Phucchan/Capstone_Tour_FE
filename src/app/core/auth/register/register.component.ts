// src/app/features/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  activeField: string | null = null;
  confirmPasswordMismatch = false;

  // Popup tiêu chí (giữ nguyên cấu trúc cũ)
  usernameCriteria = { minLength: false, maxLength: false, pattern: false };
  passwordCriteria = { minLength: false, uppercase: false, lowercase: false, specialChar: false };
  emailCriteria = { validFormat: false };
  fullNameCriteria = { pattern: false };
  phoneCriteria = { validFormat: false };
  addressCriteria = { validFormat: false };
  gendersCriteria = { validFormat: false };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  // change: validator kiểm tra 2 mật khẩu khớp nhau (validator cấp form)
  private static passwordMatch(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const re   = group.get('rePassword')?.value;
    if (!pass || !re) return null;
    return pass === re ? null : { passwordNotMatch: true };
  }

  ngOnInit(): void {
    // change: thêm pattern cho username khớp UI, phone 10 số bắt đầu bằng 0
    this.signupForm = this.fb.group(
      {
        username: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9]+$/) // change
        ]],
        email: ['', [Validators.required, Validators.email]],
        fullName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ỹ\s]+$/)]],
        gender: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^(0\d{9})$/)]],
        address: ['', [Validators.required]],
        avatarImg: ['https://cdn-icons-png.flaticon.com/512/149/149071.png'],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+$/)
        ]],
        rePassword: ['', Validators.required]
      },
      { validators: RegisterComponent.passwordMatch } // change
    );

    // change: theo dõi rePassword để cập nhật trạng thái mismatch ngay tức thì
    this.signupForm.get('rePassword')?.valueChanges.subscribe(val => {
      const pass = this.signupForm.get('password')?.value;
      this.confirmPasswordMismatch = !!pass && !!val && pass !== val;
    });

    // (tùy chọn) log rõ control invalid khi form INVALID
    this.signupForm.statusChanges.subscribe(status => {
      if (status === 'INVALID') this.logInvalidControls(); // change
    });
  }

  // change: helper nhanh cho template
  get f() { return this.signupForm.controls; }
  isInvalid(name: keyof RegisterComponent['signupForm']['controls']): boolean {
    const c = this.f[name];
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  // change: in ra bảng field nào sai (phục vụ debug)
  private logInvalidControls(): void {
    const rows = Object.keys(this.signupForm.controls)
      .map(k => {
        const c = this.signupForm.get(k)!;
        return { field: k, invalid: c.invalid, errors: c.errors, value: c.value };
      })
      .filter(r => r.invalid);
    if (rows.length) console.table(rows);
  }

  onFocus(field: string): void {
    this.activeField = field;
    const val = this.signupForm.get(field as any)?.value || '';

    if (field === 'username') {
      this.usernameCriteria.minLength = val.length >= 8;
      this.usernameCriteria.maxLength = val.length <= 30;
      this.usernameCriteria.pattern   = /^[a-zA-Z0-9]+$/.test(val);
    }
    if (field === 'email')   this.emailCriteria.validFormat   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (field === 'fullName') this.fullNameCriteria.pattern   = /^[a-zA-ZÀ-ỹ\s]+$/.test(val);
    if (field === 'phone')   this.phoneCriteria.validFormat   = /^(0\d{9})$/.test(val); // change
    if (field === 'address') this.addressCriteria.validFormat = String(val).trim().length > 0;
    if (field === 'gender')  this.gendersCriteria.validFormat = (val === 'MALE' || val === 'FEMALE');

    if (field === 'password') {
      this.passwordCriteria.minLength  = val.length >= 8;
      this.passwordCriteria.uppercase  = /[A-Z]/.test(val);
      this.passwordCriteria.lowercase  = /[a-z]/.test(val);
      this.passwordCriteria.specialChar= /\W/.test(val);
      // cập nhật mismtach ngay nếu đã nhập lại
      const re = this.f['rePassword'].value;
      this.confirmPasswordMismatch = !!re && val !== re;
      this.signupForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }
    if (field === 'rePassword') {
      const pass = this.f['password'].value;
      this.confirmPasswordMismatch = !!pass && pass !== val;
    }
  }

  onBlur(): void {
    this.activeField = null;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // change: gom thông điệp lỗi backend (string / object / array…)
  private extractErrorMessage(err: any): string {
    if (err?.error?.message) return String(err.error.message);
    if (Array.isArray(err?.error?.errors)) {
      return err.error.errors.map((e: any) => e?.message || JSON.stringify(e)).join('\n');
    }
    if (err?.error && typeof err.error === 'object') {
      try {
        const parts: string[] = [];
        for (const [k, v] of Object.entries(err.error as Record<string, any>)) {
          if (k === 'status' || k === 'code') continue;
          if (Array.isArray(v)) parts.push(`${k}: ${v.join(', ')}`);
          else if (typeof v === 'string') parts.push(`${k}: ${v}`);
        }
        if (parts.length) return parts.join('\n');
      } catch {}
    }
    return err?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.logInvalidControls(); // change
      return;
    }

    const v = this.signupForm.value;

    this.isLoading = true;
    this.errorMessage = '';

    // change: gửi cả 2 khóa xác nhận để tương thích mọi BE
    const payload = {
      username:  String(v.username || '').trim(),
      fullName:  String(v.fullName || '').trim(),
      email:     String(v.email || '').trim(),
      password:  v.password,
      repassword: v.rePassword,  // change
      rePassword: v.rePassword,  // change
      gender:    v.gender,
      phone:     String(v.phone || '').trim(),
      address:   String(v.address || '').trim()
      // Không gửi role/avatarImg vì swagger không yêu cầu
    };

    // debug nhẹ (mask password)
    const dbg = { ...payload, password: '******', repassword: '******', rePassword: '******' };
    console.log('[register] payload:', dbg);

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('[register] error:', err);
        this.isLoading = false;
        this.errorMessage = this.extractErrorMessage(err);
      }
    });
  }
}
