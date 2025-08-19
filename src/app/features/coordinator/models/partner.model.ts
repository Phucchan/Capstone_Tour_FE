// Tương ứng với các DTO của Partner ở BE

// Dùng cho các dropdown
export interface LocationShort {
  id: number;
  name: string;
}

// Dùng cho các dropdown
export interface ServiceTypeShort {
  id: number;
  code: string;
  name: string;
}

// Dùng cho bảng danh sách đối tác
// Tương ứng với PartnerSummaryDTO.java
export interface PartnerSummary {
  id: number;
  name: string;
  contactPhone: string;
  contactEmail: string;
  deleted: boolean;
}

// Dùng cho trang chi tiết và form cập nhật
// Tương ứng với PartnerDetailDTO.java
export interface PartnerDetail {
  id: number;
  name: string;
  logoUrl: string;
  contactPhone: string;
  contactEmail: string;
  contactName: string;
  description: string;
  websiteUrl: string;
  location: LocationShort;
  serviceType: ServiceTypeShort;
  // Dữ liệu để đổ vào các dropdown trên form
  locationOptions: LocationShort[];
  serviceTypeOptions: ServiceTypeShort[];
}

// Dùng để gửi dữ liệu khi tạo/cập nhật
// Tương ứng với PartnerUpdateRequestDTO.java
export interface PartnerUpdateRequest {
  name?: string;
  logoUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactName?: string;
  description?: string;
  websiteUrl?: string;
  locationId?: number;
  serviceTypeId?: number;
}
