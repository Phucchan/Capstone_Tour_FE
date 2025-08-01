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
  // Cập nhật kiểu dữ liệu cho trạng thái
  status: 'Hoạt động' | 'Vô hiệu hóa';
}

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './list-customer.component.html',
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
      // Cập nhật dữ liệu mẫu để có trạng thái "Vô hiệu hóa"
      { id: 103, fullName: 'Lê Minh Cường', email: 'cuong.le@example.com', gender: 'Nam', phone: '0905112233', role: 'User', status: 'Vô hiệu hóa' },
      { id: 104, fullName: 'Phạm Thuỳ Dung', email: 'dung.pham@example.com', gender: 'Nữ', phone: '0934567890', role: 'User', status: 'Hoạt động' }
    ];
  }

  /**
   * === THÊM PHƯƠNG THỨC MỚI TẠI ĐÂY ===
   * Hàm để thay đổi trạng thái của khách hàng khi click.
   * @param customer Khách hàng được chọn.
   */
  toggleStatus(customer: Customer): void {
    // Thay đổi trạng thái của khách hàng
    customer.status = customer.status === 'Hoạt động' ? 'Vô hiệu hóa' : 'Hoạt động';

    // Trong một ứng dụng thực tế, bạn sẽ gọi API để cập nhật trạng thái trên server ở đây.
    // Ví dụ: this.customerService.updateCustomerStatus(customer.id, customer.status).subscribe();
    console.log(`Đã cập nhật trạng thái cho khách hàng '${customer.fullName}' thành '${customer.status}'`);
  }

  viewDetails(customerId: number): void {
    console.log('Xem chi tiết cho khách hàng ID:', customerId);
    // Ví dụ: this.router.navigate(['/admin/customers', customerId]);
  }
}
