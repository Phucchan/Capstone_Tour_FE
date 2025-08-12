/*
  File: src/app/features/seller/models/request-booking-detail.model.ts (TẠO MỚI)
  Mô tả: Dùng khi nhận về kết quả sau khi duyệt một yêu cầu.
  Tương ứng với: RequestBookingDTO.java
*/
export interface RequestBookingDetail {
  id: number;
  userId: number;
  departureLocationId: number;
  priceMin?: number;
  priceMax?: number;
  destinationLocationIds: number[];
  destinationDetail: string;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  transport: string;
  tourTheme: string;
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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  reason: string | null;
}
