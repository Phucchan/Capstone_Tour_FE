
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../admin.service';
import { UserManagementRequest } from '../models/user.model';
import { CustomValidators } from '../../../../../src/app/core/validators/custom-validators';

@Component({
  selector: 'app-post-staff-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './post-staff-detail.component.html',
})
export class PostStaffDetailComponent implements OnInit {
  staffForm!: FormGroup;
  isSubmitting = false;
  availableRoles = [
    'STAFF',
    'SELLER',
    'COORDINATOR',
    'MARKETING',
    'ACCOUNTANT',
  ];
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {}

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
          updateOn: 'blur', // Chỉ validate khi người dùng rời khỏi ô input
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

  // Helper để truy cập form control dễ dàng hơn trong template
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
      this.staffForm.markAllAsTouched();
      console.log('Form is invalid:', this.staffForm.errors);
      return;
    }

    this.isSubmitting = true;
    const payload: UserManagementRequest = this.staffForm.value;

    this.adminService.createStaff(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert(res.message || 'Tạo nhân viên thành công!');
        this.router.navigate(['/admin/list-staff']);
      },
      error: (err) => {
        console.error('Failed to create staff', err);
        alert(
          err.error?.message || 'Tạo nhân viên thất bại. Vui lòng thử lại.'
        );
        this.isSubmitting = false;
      },
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
