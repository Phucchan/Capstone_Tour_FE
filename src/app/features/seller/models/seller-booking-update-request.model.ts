/*
  File: src/app/features/seller/models/seller-booking-update-request.model.ts
*/
export interface SellerBookingUpdateRequest {
  fullName: string;
  address: string;
  email: string;
  phone: string;
  paymentDeadline: string; // Gửi lên dạng ISO string
}
