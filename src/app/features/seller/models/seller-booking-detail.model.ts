/*
  File: src/app/features/seller/models/seller-booking-detail.model.ts
  Mô tả: Dùng cho trang chi tiết booking, chứa tất cả thông tin cần thiết.
*/
import { TourSchedule } from '../../../core/models/tour-schedule.model';
import { SellerBookingCustomer } from './seller-booking-customer.model';

export interface SellerBookingDetail {
  id: number;
  bookingCode: string;
  tourName: string;
  customerName: string;
  address: string;
  email: string;
  phoneNumber: string;
  paymentDeadline: string; // ISO Date String
  createdAt: string; // ISO Date String
  status: string;
  paymentMethod: string;
  operator: string;
  departureDate: string; // ISO Date String
  tourType: string;
  themes: string[];
  durationDays: number;
  departLocation: string;
  destinations: string[];
  totalSeats: number;
  soldSeats: number;
  remainingSeats: number;
  schedules: TourSchedule[];
  customers: SellerBookingCustomer[];
  totalAmount: number;

  // các thuộc tính để tính tổng số khách
  adults?: number;
  children?: number;
  infants?: number;
  toddlers?: number;
}
