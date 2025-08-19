import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  changePwForm: FormGroup;
  isLoading = false;
  message: string | null = null;
  error: string | null = null;
  // Toggle password visibility
  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;

  // Tiêu chí mật khẩu & popup
  activeField: string | null = null;
  passwordCriteria = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    specialChar: false
  };
  confirmPasswordMismatch = false;
  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private userStorageService: UserStorageService
  ) {
    this.changePwForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      rePassword: ['', Validators.required]
    });
  }
  // valid Strong password: at least 6 characters, including uppercase, lowercase, number, and special character
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasSpecialChar = /\W/.test(value);

      const valid = hasUpperCase && hasLowerCase && hasSpecialChar;
      return valid ? null : { passwordStrength: true };
    };
  }
  // valid RePassword: must match newPassword
  matchPasswordValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value;
      const rePassword = group.get('rePassword')?.value;
      return newPassword === rePassword ? null : { passwordMismatch: true };
    };
  }

 
  onSubmit() {
    this.message = null;
    this.error = null;

    if (this.changePwForm.invalid) {
      this.changePwForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, rePassword } = this.changePwForm.value;
    const userId = this.userStorageService.getUserId();
    if (!userId) {
      this.error = 'Không xác định được người dùng!';
      return;
    }

    this.isLoading = true;
    this.customerService.changePassword(userId, { currentPassword, newPassword, rePassword }).subscribe({
      next: () => {
        this.message = 'Đổi mật khẩu thành công!';
        this.isLoading = false;
        this.changePwForm.reset();
      },
      error: (err) => {
        const errorMessage = err?.error?.message || 'Đổi mật khẩu thất bại!';
        this.isLoading = false;

        if (errorMessage.toLowerCase().includes('sai') || errorMessage.toLowerCase().includes('không đúng')) {
          this.changePwForm.get('currentPassword')?.setErrors({ incorrect: true });
        } else {
          this.error = errorMessage;
        }
      }
    });
  }
  onFocus(field: string): void {
    this.activeField = field;
    const val = this.changePwForm.get(field)?.value || '';

    if (field === 'newPassword') {
      this.passwordCriteria.minLength = val.length >= 8;
      this.passwordCriteria.uppercase = /[A-Z]/.test(val);
      this.passwordCriteria.lowercase = /[a-z]/.test(val);
      this.passwordCriteria.specialChar = /\W/.test(val);
    }

    if (field === 'rePassword') {
      const password = this.changePwForm.get('newPassword')?.value;
      this.confirmPasswordMismatch = password !== val;
    }
  }

  onBlur(): void {
    this.activeField = null;
  }
}
