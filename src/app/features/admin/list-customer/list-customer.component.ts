import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Định nghĩa interface cho Khách hàng
export interface Customer {
  id: number;
  fullName: string;
  email: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  phone: string;
  role: 'Admin' | 'User';
  status: 'Hoạt động' | 'Bị khóa';
}

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './list-customer.component.html',
  // Không cần file CSS riêng khi dùng Tailwind
})
export class ListCustomerComponent implements OnInit {

  customers: Customer[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadSampleData();
  }

  loadSampleData(): void {
    this.customers = [
      { id: 101, fullName: 'Nguyễn Văn An', email: 'an.nguyen@example.com', gender: 'Nam', phone: '0987654321', role: 'User', status: 'Hoạt động' },
      { id: 102, fullName: 'Trần Thị Bích', email: 'bich.tran@example.com', gender: 'Nữ', phone: '0912345678', role: 'Admin', status: 'Hoạt động' },
      { id: 103, fullName: 'Lê Minh Cường', email: 'cuong.le@example.com', gender: 'Nam', phone: '0905112233', role: 'User', status: 'Bị khóa' },
      { id: 104, fullName: 'Phạm Thuỳ Dung', email: 'dung.pham@example.com', gender: 'Nữ', phone: '0934567890', role: 'User', status: 'Hoạt động' }
    ];
  }

  viewDetails(customerId: number): void {
    console.log('Xem chi tiết cho khách hàng ID:', customerId);
    // Ví dụ: this.router.navigate(['/admin/customers', customerId]);
  }
}
