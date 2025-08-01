// src/app/core/models/tour-schedule.model.ts

import { TourPaxFullDTO } from './tour.model';

// Dùng cho DTO của User trả về trong options
export interface UserBasic {
  id: number;
  username: string;
  fullName: string;
  avatarImg: string;
}

// Dùng cho DTO của TourPax trả về trong options
export interface TourPaxOption extends TourPaxFullDTO {
  // Kế thừa từ TourPaxFullDTO hoặc định nghĩa các trường cần thiết
  // Ví dụ: id, minQuantity, maxQuantity
}

export interface TourScheduleOptions {
  tourId: number;
  tourName: string;
  coordinators: UserBasic[];
  tourPaxes: TourPaxOption[];
}

export interface TourSchedule {
  id: number;
  coordinatorId: number;
  tourPaxId: number;
  departureDate: string; // Dữ liệu từ backend là LocalDateTime, nhận về dạng string ISO
  endDate: string;
  coordinator?: UserBasic;
  tourPax?: TourPaxOption;
  price?: number;
  extraHotelCost?: number;
  availableSeats?: number;
}

export interface TourScheduleCreateRequest {
  coordinatorId: number;
  tourPaxId: number;
  departureDate: string; // Gửi lên server dưới dạng ISO string
  endDate?: string; // Backend sẽ tự tính nếu không có
}
