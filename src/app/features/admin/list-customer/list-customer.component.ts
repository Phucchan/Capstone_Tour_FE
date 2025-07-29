import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Cần thiết cho *ngFor, [ngClass]
import { Router, RouterModule } from '@angular/router'; // Cần cho việc điều hướng

// Định nghĩa một interface để code an toàn và dễ đọc hơn
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
  standalone: true, // Đảm bảo component của bạn là standalone
  imports: [
    CommonModule,   // Import CommonModule để sử dụng các directive như *ngFor
    RouterModule    // Import RouterModule để chuẩn bị cho việc điều hướng
  ],
  templateUrl: './list-customer.component.html',
  styleUrl: './list-customer.component.css'
})
export class ListCustomerComponent implements OnInit {

  // Khai báo mảng 'customers' mà file HTML đang sử dụng
  customers: Customer[] = [];

  // Tiêm (inject) Router service để có thể điều hướng trang
  constructor(private router: Router) {}

  // Sử dụng ngOnInit để tải dữ liệu khi component được khởi tạo
  ngOnInit(): void {
    // Trong thực tế, bạn sẽ gọi API ở đây. Hiện tại, chúng ta dùng dữ liệu mẫu.
    this.loadSampleData();
  }

  /**
   * Hàm để tải dữ liệu mẫu.
   * Hãy thay thế hàm này bằng lời gọi đến service/API của bạn.
   */
  loadSampleData(): void {
    this.customers = [
      { id: 1, fullName: 'Nguyễn Văn An', email: 'an.nguyen@example.com', gender: 'Nam', phone: '0912345678', role: 'User', status: 'Hoạt động' },
      { id: 2, fullName: 'Trần Thị Bích', email: 'bich.tran@example.com', gender: 'Nữ', phone: '0987654321', role: 'User', status: 'Hoạt động' },
      { id: 3, fullName: 'Lê Văn Cường', email: 'cuong.le@example.com', gender: 'Nam', phone: '0905112233', role: 'User', status: 'Bị khóa' },
      { id: 4, fullName: 'Phạm Thị Dung', email: 'dung.pham@example.com', gender: 'Nữ', phone: '0934556677', role: 'Admin', status: 'Hoạt động' }
    ];
  }

  /**
   * Định nghĩa phương thức viewDetails(id) được gọi từ nút "Chi tiết"
   * @param customerId ID của khách hàng cần xem chi tiết
   */
  viewDetails(customerId: number): void {
    console.log('Xem chi tiết cho khách hàng có ID:', customerId);

    // Logic để điều hướng đến trang chi tiết khách hàng.
    // Ví dụ: this.router.navigate(['/admin/customer-details', customerId]);
  }
}
