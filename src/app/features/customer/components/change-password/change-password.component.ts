import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  changePwForm: FormGroup;
  isLoading = false;
  message: string | null = null;
  error: string | null = null;

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

  onSubmit() {
    this.message = null;
    this.error = null;

    if (this.changePwForm.invalid) {
      this.changePwForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, rePassword } = this.changePwForm.value;
    if (newPassword !== rePassword) {
      this.error = 'Mật khẩu mới và nhập lại không khớp!';
      return;
    }

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
        this.error = err?.error?.message || 'Đổi mật khẩu thất bại!';
        this.isLoading = false;
      }
    });
  }
}
