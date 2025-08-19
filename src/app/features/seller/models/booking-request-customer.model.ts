// File: src/app/features/seller/models/booking-request-customer.model.ts
// Dựa trên BookingRequestCustomerDTO.java
export interface BookingRequestCustomer {
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string; // YYYY-MM-DD
  singleRoom: boolean;
  paxType: 'ADULT' | 'CHILD' | 'INFANT' | 'TODDLER';
  email?: string;
  phoneNumber?: string;
  address?: string;
  pickUpAddress?: string;
  note?: string;
}

