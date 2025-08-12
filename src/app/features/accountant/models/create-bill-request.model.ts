import { PaymentMethod, PaymentType } from '../../../core/models/enums';

export interface CreateBillRequest {
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
}
