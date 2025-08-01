/*
  File: src/app/features/seller/models/seller-booking-create-request.model.ts
  Lý do: Định nghĩa cấu trúc dữ liệu để gửi lên API khi tạo booking.
         Cấu trúc này dựa trên SellerBookingCreateRequestDTO ở backend.
*/
import { BookingRequestCustomer } from './booking-request-customer.model';

export interface SellerBookingCreateRequest {
  tourId: number;
  scheduleId: number;
  note: string;
  paymentMethod: 'VNPAY' | 'CASH'; // Giả sử có 2 phương thức này

  // Thông tin người đặt
  fullName: string;
  email: string;
  phone: string;
  address: string;

  // Danh sách khách hàng
  customers: BookingRequestCustomer[];
}
