/*
 * FILE: src/app/features/admin/post-staff-detail/post-staff-detail.component.ts
 * MÔ TẢ:
 * - Thêm các module NG-ZORRO cần thiết cho form.
 * - Thay thế alert() bằng NzMessageService để có thông báo đẹp hơn.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// --- [THAY ĐỔI] Import các module của NG-ZORRO ---
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AdminService } from '../../services/admin.service';
import { UserManagementRequest } from '../../models/user.model';
import { CustomValidators } from '../../../../core/validators/custom-validators';

@Component({
  selector: 'app-post-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // --- [THAY ĐỔI] Thêm các module NG-ZORRO vào imports ---
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzSpinModule,
  ],
  templateUrl: './post-staff-detail.component.html',
})
export class PostStaffDetailComponent implements OnInit {
  staffForm!: FormGroup;
  isSubmitting = false;
  availableRoles = [
    'SELLER',
    'BUSINESS_DEPARTMENT',
    'SERVICE_COORDINATOR',
    'MARKETING_MANAGER',
    'ACCOUNTANT',
  ];
  hidePassword = true;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private location = inject(Location);
  // --- [THAY ĐỔI] Inject NzMessageService ---
  private message = inject(NzMessageService);

  constructor() {}

  ngOnInit(): void {
    this.staffForm = this.fb.group({
      fullName: ['', Validators.required],
      username: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9_-]{8,30}$/),
          ],
          asyncValidators: [
            CustomValidators.createUsernameTakenValidator(this.adminService),
          ],
          updateOn: 'blur',
        },
      ],
      email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [
            CustomValidators.createEmailTakenValidator(this.adminService),
          ],
          updateOn: 'blur',
        },
      ],
      phone: ['', [Validators.required, CustomValidators.vietnamesePhone]],
      password: ['', [Validators.required, CustomValidators.strongPassword]],
      roleNames: this.fb.array([], Validators.required),
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.staffForm.controls;
  }

  onRoleChange(event: Event): void {
    const roleNamesArray = this.staffForm.get('roleNames') as FormArray;
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      roleNamesArray.push(this.fb.control(target.value));
    } else {
      const index = roleNamesArray.controls.findIndex(
        (x) => x.value === target.value
      );
      if (index !== -1) {
        roleNamesArray.removeAt(index);
      }
    }
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      Object.values(this.staffForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmitting = true;
    const payload: UserManagementRequest = this.staffForm.value;

    this.adminService.createStaff(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.message.success(res.message || 'Tạo nhân viên thành công!');
        this.router.navigate(['/admin/list-staff']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.message.error(
          err.error?.message || 'Tạo nhân viên thất bại. Vui lòng thử lại.'
        );
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
