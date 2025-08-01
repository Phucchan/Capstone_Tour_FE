// File: src/app/features/seller/models/seller-booking-detail.model.ts
import { TourSchedule } from '../../../core/models/tour-schedule.model';

export interface SellerBookingDetail {
  id: number;
  bookingCode: string;
  tourName: string;
  createdAt: string;
  status: string;
  operator: string;
  departureDate: string;
  tourType: string;
  themes: string[];
  durationDays: number;
  departLocation: string;
  destinations: string[];
  totalSeats: number;
  soldSeats: number;
  remainingSeats: number;
  schedules: TourSchedule[]; // Tái sử dụng model đã có
}
