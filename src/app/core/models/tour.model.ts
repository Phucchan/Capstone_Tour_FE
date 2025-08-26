// src/app/core/models/tour.model.ts

import { CostType } from './enums';

//Enum cho phương tiện di chuyển, đồng bộ với backend
export enum TourTransport {
  CAR = 'CAR',
  MOTORBIKE = 'MOTORBIKE',
  PLANE = 'PLANE',
  TRAIN = 'TRAIN',
  CRUISE_SHIP = 'CRUISE_SHIP',
}

// Interface cho thông tin request booking lồng trong tour detail
export interface RequestBookingInfo {
  id: number;
  startDate: string;
  endDate: string;
}

// Dùng cho các dropdown
export interface TourOption {
  id: number;
  name: string;
}

// Dùng cho danh sách tour
export interface TourListItem {
  id: number;
  code: string;
  name: string;
  thumbnailImage: string;
  typeName: string;
  tourStatus: string;
  durationDays: number;
  tourTransport: string;
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
  tourTransport: TourTransport;
  departLocation: TourOption;
  destinations: TourOption[];
  themes: TourOption[];
  requestBooking?: RequestBookingInfo | null;
}

/**
 * @description Dữ liệu gửi đi khi TẠO tour.
 */
export interface CreateTourRequest {
  name: string;
  thumbnailUrl: string;
  description: string;
  tourTransport: TourTransport;
  departLocationId: number;
  destinationLocationIds: number[];
  tourThemeIds: number[];
}

/**
 * @description Dữ liệu gửi đi khi CẬP NHẬT tour.
 */
export interface UpdateTourRequest {
  name: string;
  thumbnailUrl: string;
  description: string;
  tourStatus: string;
  tourTransport: TourTransport;
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
  code?: string;
}

//CÁC MODEL CHO TRANG CHIẾT TÍNH
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
  previewSellingPrice?: number;
}

export interface TourPriceCalculateRequestDTO {
  profitRate: number;
  extraCost: number;
}

export interface TourPaxCreateRequestDTO {
  minQuantity: number;
  maxQuantity: number;
}

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
  serviceTypes: ServiceTypeShortDTO[];
  services?: ServiceInfoDTO[];
}

export interface TourDayManagerCreateRequestDTO {
  title: string;
  locationId: number | null;
  description?: string;
}

export interface ServiceInfoDTO {
  id: number;
  name: string;
  partnerName: string;
  serviceTypeName: string;
}

export interface PartnerServiceCreateDTO {
  name: string;
  serviceTypeId: number;
  partnerId: number;
  description?: string;
}

export interface TourCostSummary {
  totalFixedCost: number;
  totalPerPersonCost: number;
}
