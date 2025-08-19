// Tương ứng với ServiceTypeDTO.java
export interface ServiceType {
  id: number;
  code: string;
  name: string;
  deleted?: boolean; // Thêm deleted để quản lý trạng thái ở FE
}

// Tương ứng với ChangeDeleteStatusDTO.java
export interface ChangeStatusRequest {
  deleted: boolean;
}
