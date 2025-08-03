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
  paymentDeadline: string; // Giữ dạng string (ISO date)
  createdAt: string;
  status: string;
  paymentMethod: string; // THÊM DÒNG NÀY
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
  schedules: TourSchedule[];
  customers: SellerBookingCustomer[];
  totalAmount: number;
}
