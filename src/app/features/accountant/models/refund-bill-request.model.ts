/*
----------------------------------------------------------------
-- File: src/app/features/accountant/models/refund-bill-request.model.ts
-- Ghi chú: Model cho request body khi tạo phiếu hoàn tiền.
----------------------------------------------------------------
*/
import {
  PaymentMethod,
  PaymentType,
  PaymentBillItemStatus,
} from '../../../core/models/enums';

export interface RefundBillRequest {
  payTo: string;
  paidBy: string;
  createdDate: string; // ISO 8601 format string
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  note: string;
  content: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  amount: number;
  status: PaymentBillItemStatus;
}
