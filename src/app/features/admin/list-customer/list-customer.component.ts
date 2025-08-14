import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../admin.service';
import { UserFullInformation } from '../models/user.model';
// SỬA LỖI: Dùng đường dẫn tương đối
import { Paging } from '../../../core/models/paging.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    SpinnerComponent,
    AvatarComponent,
    PaginationComponent,
  ],
  templateUrl: './list-customer.component.html',
})
export class ListCustomerComponent implements OnInit {
  customers: UserFullInformation[] = [];
  paging: Paging<UserFullInformation> | null = null;
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  keyword = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.adminService
      .getCustomers(this.currentPage, this.pageSize, this.keyword)
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.customers = response.data.items;
            this.paging = response.data;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load customers', err);
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCustomers();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadCustomers();
  }
}
