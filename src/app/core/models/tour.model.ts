// src/app/core/models/tour.model.ts

import { CostType } from "./enums";

// Dùng cho các dropdown
export interface TourOption {
  id: number;
  name: string;
}

// Dùng cho danh sách tour
export interface TourListItem {
  id: number;
  name: string;
  thumbnailImage: string;
  typeName: string;
  tourStatus: string;
  durationDays: number;
}

/**
 * @description Dữ liệu chi tiết tour trả về từ API.
 * Cấu trúc này khớp với TourDetailManagerDTO đã sửa ở backend.
 */
export interface TourDetail {
  id: number;
  name: string;
  code: string;
  thumbnailUrl: string;
  description: string;
  tourType: string;
  tourStatus: string;
  departLocation: TourOption; // <-- Đã sửa: object
  destinations: TourOption[]; // <-- Đã sửa: mảng object
  themes: TourOption[]; // <-- Đã sửa: mảng object
}

/**
 * @description Dữ liệu gửi đi khi TẠO tour.
 */
export interface CreateTourRequest {
  name: string;
  // code không cần gửi đi, backend tự tạo
  thumbnailUrl: string;
  description: string;
  departLocationId: number;
  destinationLocationIds: number[];
  tourThemeIds: number[];
}

/**
 * @description Dữ liệu gửi đi khi CẬP NHẬT tour.
 */
export interface UpdateTourRequest {
  name: string;
  // code: string;
  thumbnailUrl: string;
  description: string;
  tourStatus: string; // Cho phép sửa trạng thái
  departLocationId: number;
  destinationLocationIds: number[];
  tourThemeIds: number[];
}

/**
 * @description Dữ liệu cho các dropdowns từ API /options.
 */
export interface TourOptionsData {
  themes: TourOption[];
  departures: TourOption[];
  destinations: TourOption[];
}

/**
 * @description Dữ liệu trả về từ API chi tiết tour, bao gồm cả options.
 */
export interface TourDetailWithOptions {
  detail: TourDetail;
  options: TourOptionsData;
}

/**
 * @description Dữ liệu rút gọn của một loại dịch vụ
 */
export interface ServiceTypeShortDTO {
  id: number;
  name: string;
  code?: string; // Thêm code để khớp với backend
}

//CÁC MODEL CHO TRANG CHIẾT TÍNH
// Dữ liệu chi tiết của một dịch vụ trong bảng chiết tính
export interface ServiceBreakdownDTO {
  dayId: number;
  serviceId: number;
  dayNumber: number;
  serviceTypeName: string;
  partnerName: string;
  partnerAddress: string;
  nettPrice: number;
  sellingPrice: number;
  costType: CostType;
}

// Dữ liệu đầy đủ của một khoảng khách, bao gồm cả giá đã tính
export interface TourPaxFullDTO {
  id: number;
  tourId: number;
  minQuantity: number;
  maxQuantity: number;
  fixedPrice: number | null;
  extraHotelCost: number | null;
  sellingPrice: number | null;
  manualPrice: boolean;
  isDeleted: boolean;
  // Trường này chỉ dùng ở frontend để xem trước
  previewSellingPrice?: number;
}

// Dữ liệu gửi lên khi yêu cầu tính giá
export interface TourPriceCalculateRequestDTO {
  profitRate: number;
  extraCost: number;
}


/**
 * @description Dữ liệu gửi đi khi TẠO một khoảng khách mới
 */
export interface TourPaxCreateRequestDTO {
  minQuantity: number;
  maxQuantity: number;
}

// Dữ liệu gửi đi khi TẠO hoặc CẬP NHẬT một khoảng khách mới
export interface TourPaxRequestDTO {
  minQuantity: number;
  maxQuantity: number;
  fixedPrice?: number | null;
  sellingPrice?: number | null;
  manualPrice?: boolean;
}


export interface PartnerServiceShortDTO {
  id: number;
  name: string;
  partnerName: string;
  serviceTypeName: string;
}

export interface TourDayManagerDTO {
  id: number;
  dayNumber: number;
  title: string;
  description: string | null;
  location: TourOption | null;
  //  Thuộc tính này chứa các loại dịch vụ chung
  serviceTypes: ServiceTypeShortDTO[];
  //  Thuộc tính này chứa các dịch vụ cụ thể đã được thêm vào
  services?: PartnerServiceShortDTO[];
}

export interface TourDayManagerCreateRequestDTO {
  title: string;
  locationId: number | null;
  description?: string;
  // Thuộc tính này không còn dùng để lưu dịch vụ cụ thể nữa
  serviceTypeIds: number[];
}

export interface ServiceInfoDTO {
  id: number;
  name: string;
  partnerName: string;
  serviceTypeName: string;
}

// Interface mô tả API cost-summary
export interface TourCostSummary {
  totalFixedCost: number;
  totalPerPersonCost: number;
}
