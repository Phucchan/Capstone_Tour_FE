/*
  File: src/app/features/seller/models/seller-booking-customer.model.ts
*/
export interface SellerBookingCustomer {
  id: number;
  fullName: string;
  phoneNumber: string | null;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  paxType: 'ADULT' | 'CHILD' | 'INFANT' | 'TODDLER';
  pickUpAddress: string | null;
  singleRoom: boolean;
  note: string | null;
  status: 'ACTIVE' | 'DELETED';
}
