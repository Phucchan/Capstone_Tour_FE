// Định nghĩa cho dữ liệu đầy đủ trả về trong danh sách
export interface UserFullInformation {
  id: number;
  fullName: string;
  username: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: string;
  avatarImage: string;
  roleNames: string[];
  deleted: boolean;
  createdAt: string; // Chuỗi ngày tháng theo chuẩn ISO
  updatedAt: string; // Chuỗi ngày tháng theo chuẩn ISO
}

// Định nghĩa cho dữ liệu gửi đi khi tạo mới nhân viên
export interface UserManagementRequest {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  roleNames: string[];
}

// Định nghĩa cho việc thay đổi trạng thái
export interface ChangeStatusRequest {
  newStatus: 'ACTIVE' | 'INACTIVE' | 'DELETED'; // Các trạng thái có thể có từ BE
}
