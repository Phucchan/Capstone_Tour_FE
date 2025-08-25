/*
----------------------------------------------------------------
-- File: src/app/features/accountant/models/create-bill-request.model.ts
-- Ghi chú: Model cho request tạo phiếu chi/thu/hoàn tiền.
--          Model này ánh xạ trực tiếp tới CreateBillRequestDTO của backend.
----------------------------------------------------------------
*/
import { PaymentMethod, PaymentType } from '../../../core/models/enums';

export interface CreateBillRequest {
  // Các trường cho PaymentBill
  payTo: string;
  paidBy: string;
  createdDate: string; // Gửi dưới dạng ISO string
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  note?: string;

  // Trường cho PaymentBillItem
  content: string;
}
