import { CostType } from '../../../core/models/enums';

// Định nghĩa các trạng thái phê duyệt dịch vụ một cách tường minh
export type PartnerServiceStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface ServiceInfo {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  nettPrice: number;
  sellingPrice: number;
  costType: CostType; // Sử dụng enum đã có
  status: PartnerServiceStatus; // Sử dụng kiểu dữ liệu đã định nghĩa
  partnerName: string;
  serviceTypeName: string;
}

export interface PendingServiceUpdateRequest {
  newStatus: 'ACTIVE' | 'REJECTED';
  // Các trường khác có thể thêm vào nếu muốn cho phép Coordinator sửa thông tin khi duyệt
  // nettPrice?: number;
  // sellingPrice?: number;
}
