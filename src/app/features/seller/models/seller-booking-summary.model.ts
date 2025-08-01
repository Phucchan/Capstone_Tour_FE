// File: src/app/features/seller/models/seller-booking-summary.model.ts
export interface SellerBookingSummary {
  id: number;
  tourName: string;
  departureDate: string; // Sử dụng string để dễ dàng xử lý, có thể chuyển thành Date nếu cần
  bookingCode: string;
  seats: number;
  customer: string;
  status: string;
}

