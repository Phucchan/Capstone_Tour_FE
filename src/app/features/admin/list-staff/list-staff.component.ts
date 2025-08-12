import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminService } from '../admin.service';
import { UserFullInformation } from '../models/user.model';
// SỬA LỖI: Dùng đường dẫn tương đối
import { Paging } from '../../../core/models/paging.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-list-staff',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SpinnerComponent,
    AvatarComponent,
    PaginationComponent,
  ],
  templateUrl: './list-staff.component.html',
})
export class ListStaffComponent implements OnInit {
  staffs: UserFullInformation[] = [];
  paging: Paging<UserFullInformation> | null = null;
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  keyword = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.adminService
      .getStaff(this.currentPage, this.pageSize, this.keyword)
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.staffs = response.data.items;
            this.paging = response.data;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load staff', err);
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadStaff();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadStaff();
  }

  toggleStatus(staff: UserFullInformation): void {
    const newStatus = staff.deleted ? 'ACTIVE' : 'INACTIVE';
    this.adminService.changeUserStatus(staff.id, { newStatus }).subscribe({
      next: () => {
        this.loadStaff();
      },
      error: (err) => {
        console.error(`Failed to change status for staff ${staff.id}`, err);
      },
    });
  }
}
