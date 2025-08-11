import { BookingServiceSettlement } from './booking-service-settlement.model';
import { PaymentBillList } from './payment-bill-list.model';

export interface BookingSettlement {
  bookingId: number;
  bookingCode: string;
  tourName: string;
  startDate: string;
  endDate: string;
  tourType: string;
  duration: number;
  status: string;
  services: BookingServiceSettlement[];
  receiptBills: PaymentBillList[];
  paymentBills: PaymentBillList[];
  refundBills: PaymentBillList[];
}
