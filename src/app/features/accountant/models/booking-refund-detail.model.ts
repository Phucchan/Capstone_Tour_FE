/*
----------------------------------------------------------------
-- File: src/app/features/accountant/models/booking-refund-detail.model.ts
-- Ghi chú: Model cho dữ liệu trang chi tiết yêu cầu hoàn tiền.
----------------------------------------------------------------
*/
import { RefundBill } from './refund-bill.model';

export interface BookingRefundDetail {
  bookingId: number;
  bookingCode: string;
  tourCode: string;
  tourName: string;
  tourType: string;
  startDate: string; // Sử dụng string
  status: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  refundAmount: number;
  bankAccountNumber: string;
  bankAccountHolder: string;
  bankName: string;
  refundBill: RefundBill | null;
}
