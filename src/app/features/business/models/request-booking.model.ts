// src/app/features/business/models/request-booking.model.ts

import { PagingDTO } from '../../../core/models/paging.model';

// Enum cho trạng thái của yêu cầu
export enum RequestBookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
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
export type RequestBookingPage = PagingDTO<RequestBookingNotification>;

// Interface cho chi tiết một yêu cầu (sẽ dùng cho trang chi tiết sau này)
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
  transport: string; // Giả sử là string, có thể là Enum nếu cần
  adults: number;
  children: number;
  infants: number;
  toddlers: number;
  hotelRooms: number;
  roomCategory: string; // Giả sử là string
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: RequestBookingStatus;
}
