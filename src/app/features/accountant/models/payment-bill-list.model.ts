import {
  PaymentMethod,
  PaymentType,
  PaymentBillItemStatus,
} from '../../../core/models/enums';

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
  // Tthuộc tính status để theo dõi trạng thái của phiếu.
  // Backend cần trả về giá trị này ('PENDING' hoặc 'PAID').
  status: PaymentBillItemStatus;
}
