import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Định nghĩa interface cho Nhân viên để đảm bảo an toàn kiểu dữ liệu
export interface Staff {
  id: number;
  fullName: string;
  email: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  phone: string;
  role: 'Admin' | 'User'; // Có thể mở rộng thành 'Manager', 'Accountant', etc.
  status: 'Hoạt động' | 'Bị khóa';
}

@Component({
  selector: 'app-list-staff', // Đã đổi selector
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './list-staff.component.html', // Đã đổi template
  styleUrl: './list-staff.component.css'     // Đã đổi style
})
export class ListStaffComponent implements OnInit {

  // Khai báo mảng 'staff' để file HTML sử dụng
  staff: Staff[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Trong thực tế, bạn sẽ gọi API ở đây. Hiện tại, chúng ta dùng dữ liệu mẫu.
    this.loadSampleData();
  }

  /**
   * Hàm để tải dữ liệu mẫu cho nhân viên.
   * Hãy thay thế hàm này bằng lời gọi đến service/API của bạn.
   */
  loadSampleData(): void {
    this.staff = [
      { id: 1, fullName: 'Hoàng Minh Tuấn', email: 'tuan.hoang@company.com', gender: 'Nam', phone: '0911111111', role: 'Admin', status: 'Hoạt động' },
      { id: 2, fullName: 'Nguyễn Thị Lan Anh', email: 'lananh.nguyen@company.com', gender: 'Nữ', phone: '0922222222', role: 'User', status: 'Hoạt động' },
      { id: 3, fullName: 'Trần Đức Bo', email: 'bo.tran@company.com', gender: 'Nam', phone: '0933333333', role: 'User', status: 'Bị khóa' },
      { id: 4, fullName: 'Lê Thu Trang', email: 'trang.le@company.com', gender: 'Nữ', phone: '0944444444', role: 'User', status: 'Hoạt động' }
    ];
  }

  /**
   * Định nghĩa phương thức viewDetails(id) được gọi từ nút "Chi tiết"
   * @param staffId ID của nhân viên cần xem chi tiết
   */
  viewDetails(staffId: number): void {
    console.log('Xem chi tiết cho nhân viên có ID:', staffId);

    // Logic để điều hướng đến trang chi tiết nhân viên.
    // Ví dụ: this.router.navigate(['/admin/staff-details', staffId]);
  }
}
