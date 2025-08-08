/*
----------------------------------------------------------------
-- File: src/app/features/accountant/models/refund-bill.model.ts
-- Ghi chú: Model cho dữ liệu hiển thị của phiếu hoàn tiền.
----------------------------------------------------------------
*/
import {
  PaymentMethod,
  PaymentType,
  PaymentBillItemStatus,
} from '../../../core/models/enums';

export interface RefundBillItem {
  content: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  amount: number;
  status: PaymentBillItemStatus;
}

export interface RefundBill {
  bookingCode: string;
  payTo: string;
  paidBy: string;
  createdDate: string; // Sử dụng string để dễ dàng xử lý
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  note: string;
  totalAmount: number;
  items: RefundBillItem[];
}
