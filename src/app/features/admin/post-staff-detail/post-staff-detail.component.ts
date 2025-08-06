import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../admin.service';
import { UserManagementRequest } from '../models/user.model';

@Component({
  selector: 'app-post-staff-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './post-staff-detail.component.html',
})
export class PostStaffDetailComponent implements OnInit {
  staffForm: FormGroup;
  isSubmitting = false;
  availableRoles = ['STAFF', 'SELLER', 'COORDINATOR'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {
    this.staffForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // Sử dụng FormArray để quản lý danh sách vai trò
      roleNames: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {}

  /**
   * Xử lý sự kiện khi người dùng check/uncheck vai trò.
   * @param event Sự kiện change từ checkbox
   */
  onRoleChange(event: Event): void {
    const roleNamesArray = <FormArray>this.staffForm.controls['roleNames'];
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      roleNamesArray.push(this.fb.control(target.value));
    } else {
      let i = 0;
      roleNamesArray.controls.forEach((item) => {
        if (item.value == target.value) {
          roleNamesArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    // Lấy giá trị từ form, bao gồm cả mảng roleNames
    const payload: UserManagementRequest = this.staffForm.value;

    this.adminService.createStaff(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Có thể thêm thông báo thành công ở đây
        this.router.navigate(['/admin/list-staff']);
      },
      error: (err) => {
        console.error('Failed to create staff', err);
        this.isSubmitting = false;
        // Có thể thêm thông báo lỗi ở đây
      },
    });
  }
}
