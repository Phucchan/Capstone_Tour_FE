import { CostType } from '../../../core/models/enums';

// Định nghĩa các trạng thái phê duyệt dịch vụ
export type PartnerServiceStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface ServiceInfo {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  nettPrice: number;
  sellingPrice: number;
  costType: CostType;
  status: PartnerServiceStatus;
  partnerName: string;
  serviceTypeName: string;
}

export interface PendingServiceUpdateRequest {
  newStatus: 'ACTIVE' | 'REJECTED';
  nettPrice?: number;
  sellingPrice?: number;
}
