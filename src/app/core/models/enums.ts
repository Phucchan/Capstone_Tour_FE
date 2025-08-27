export enum CostType {
  FIXED = 'FIXED',
  PER_PERSON = 'PER_PERSON',
}

export type BookingStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'CANCEL_REQUESTED'
  | 'REFUNDED';

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANKING',
}

export enum PaymentType {
  DEPOSIT = 'DEPOSIT',
  FINAL_PAYMENT = 'FINAL_PAYMENT',
  REFUND = 'REFUND',
  OTHER = 'OTHER',
  RECEIPT = 'RECEIPT',
  PAYMENT = 'PAYMENT',
}

export enum PaymentBillItemStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
}

