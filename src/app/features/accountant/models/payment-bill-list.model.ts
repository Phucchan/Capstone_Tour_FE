import { PaymentMethod, PaymentType } from '../../../core/models/enums';

export interface PaymentBillList {
  billId: number;
  billNumber: string;
  bookingCode: string;
  payTo: string;
  paidBy: string;
  createdDate: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  totalAmount: number;
}
