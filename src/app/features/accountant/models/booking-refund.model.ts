/*
----------------------------------------------------------------
-- File: src/app/features/accountant/models/booking-refund.model.ts
-- Ghi chú: Model cho dữ liệu hiển thị trên danh sách yêu cầu hoàn tiền.
----------------------------------------------------------------
*/
export interface BookingRefund {
  bookingId: number;
  tourCode: string;
  tourName: string;
  tourType: string;
  startDate: string; // Sử dụng string để dễ dàng xử lý, có thể chuyển đổi từ LocalDateTime
  status: string;
  customerName: string;
}
