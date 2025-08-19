// src/app/features/business/models/request-booking.model.ts

import { Paging } from '../../../core/models/paging.model';

// Enum cho trạng thái của yêu cầu
export enum RequestBookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// Interface cho một item trong danh sách thông báo yêu cầu
export interface RequestBookingNotification {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  destinations: string[];
  startDate: string; // Dạng 'YYYY-MM-DD'
  endDate: string; // Dạng 'YYYY-MM-DD'
  createdAt: string; // Dạng ISO 8601
  detailUrl: string;
  status: RequestBookingStatus;
}

// Interface cho dữ liệu phân trang của danh sách yêu cầu
export type RequestBookingPage = Paging<RequestBookingNotification>;

// Dùng cho trang chi tiết, khớp với RequestBookingDTO
export interface RequestBookingDetail {
  id: number;
  userId: number | null;
  departureLocationId: number;
  priceMin: number;
  priceMax: number;
  destinationLocationIds: number[];
  destinationDetail: string;
  startDate: string;
  endDate: string;
  transport: string;
  tourThemeIds: number[];
  desiredServices: string;
  adults: number;
  children: number;
  infants: number;
  toddlers: number;
  hotelRooms: number;
  roomCategory: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: RequestBookingStatus;
  reason: string | null;
}
