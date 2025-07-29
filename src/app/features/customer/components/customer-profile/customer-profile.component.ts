import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { BirthDate } from '../../../../shared/pipes/birthdate.pipe';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';

@Component({
  selector: 'app-customer-profile',
  imports: [
    CommonModule,
    FormsModule,
    BirthDate,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})

export class CustomerProfileComponent {
  @Input() currentUser: UserProfile | null = null;
  editableUser: Partial<UserProfile> = {};
  isEditMode = false;
  editFieldKey: keyof UserProfile | null = null;
  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private userStorageService: UserStorageService,
    private currentUserService: CurrentUserService
  ) { }
  /** Lấy thông tin người dùng từ service */
  ngOnInit(): void {
    const userId = this.currentUserService.getCurrentUser().id;
    if (userId) {
      this.customerService.getUserProfile(userId).subscribe(res => {
        this.currentUser = res.data;
        this.profileForm = this.fb.group({
          fullName: [res.data.fullName, [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ỹ\s]+$/)]],
          gender: [res.data.gender, Validators.required],
          email: [res.data.email, [Validators.required, Validators.email]],
          phone: [res.data.phone, [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
          address: [res.data.address, Validators.required],
          dateOfBirth: [res.data.dateOfBirth],
        });
      });
    }
  }

  ngOnChanges() {
    if (this.currentUser) {
      this.editableUser = { ...this.currentUser };
    }
  }
  /** Khi bấm vào icon ✏️ */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.editableUser = { ...this.currentUser! };
    }
  }

  onSave() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const userId = this.userStorageService.getUserId();
    if (!userId) {
      alert('Không xác định được người dùng!');
      return;
    }
    const updateData = {
      fullName: this.profileForm.value.fullName,
      gender: this.profileForm.value.gender,
      email: this.profileForm.value.email,
      phone: this.profileForm.value.phone,
      address: this.profileForm.value.address,
      avatarImg: this.currentUser?.avatarImg,         // giữ nguyên từ backend
      dateOfBirth: this.profileForm.value.dateOfBirth
    };

    this.customerService.updateProfile(userId, updateData).subscribe({
      next: () => {
        this.customerService.getUserProfile(userId!).subscribe(res => {
          this.currentUser = res.data;
          this.profileForm.patchValue(res.data);
          this.isEditMode = false;
        });
        alert('Cập nhật thành công!');
      },
      error: () => {
        alert('Cập nhật thất bại!');
      }
    });
  }
  /** Khi bấm vào icon ❌ */
  cancelEdit() {
    this.editableUser = { ...this.currentUser! };
    this.isEditMode = false;
    this.editFieldKey = null;
  }
}

export interface UserProfile {
  email: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  totalToursBooked: number;
  phone: string;
  address: string;
  avatarImg: string;
  dateOfBirth: string; // yyyy-MM-dd
  points: number;
}
