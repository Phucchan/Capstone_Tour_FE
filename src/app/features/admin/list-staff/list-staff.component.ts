import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Định nghĩa interface cho Nhân viên
export interface Staff {
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
  selector: 'app-list-staff',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './list-staff.component.html',
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
   */
  loadSampleData(): void {
    this.staff = [
      { id: 1, fullName: 'Hoàng Minh Tuấn', email: 'tuan.hoang@company.com', gender: 'Nam', phone: '0911111111', role: 'Admin', status: 'Hoạt động' },
      { id: 2, fullName: 'Nguyễn Thị Lan Anh', email: 'lananh.nguyen@company.com', gender: 'Nữ', phone: '0922222222', role: 'User', status: 'Hoạt động' },
      // Cập nhật dữ liệu mẫu để có trạng thái "Vô hiệu hóa"
      { id: 3, fullName: 'Trần Đức Bo', email: 'bo.tran@company.com', gender: 'Nam', phone: '0933333333', role: 'User', status: 'Vô hiệu hóa' },
      { id: 4, fullName: 'Lê Thu Trang', email: 'trang.le@company.com', gender: 'Nữ', phone: '0944444444', role: 'User', status: 'Hoạt động' }
    ];
  }

  /**
   * === THÊM PHƯƠNG THỨC MỚI TẠI ĐÂY ===
   * Hàm để thay đổi trạng thái của nhân viên khi click.
   * @param staffMember Nhân viên được chọn.
   */
  toggleStatus(staffMember: Staff): void {
    // Thay đổi trạng thái của nhân viên
    staffMember.status = staffMember.status === 'Hoạt động' ? 'Vô hiệu hóa' : 'Hoạt động';

    // Trong một ứng dụng thực tế, bạn sẽ gọi API để cập nhật trạng thái trên server ở đây.
    // Ví dụ: this.staffService.updateStaffStatus(staffMember.id, staffMember.status).subscribe();
    console.log(`Đã cập nhật trạng thái cho nhân viên '${staffMember.fullName}' thành '${staffMember.status}'`);
  }

  /**
   * Định nghĩa phương thức viewDetails(id) được gọi từ nút "Chi tiết"
   * @param staffId ID của nhân viên cần xem chi tiết
   */
  viewDetails(staffId: number): void {
    console.log('Xem chi tiết cho nhân viên có ID:', staffId);
    // Logic để điều hướng đến trang chi tiết nhân viên.
    // Ví dụ: this.router.navigate(['/admin/staff', staffId]);
  }
}
