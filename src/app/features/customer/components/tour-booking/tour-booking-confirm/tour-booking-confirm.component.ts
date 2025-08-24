import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrencyVndPipe } from "../../../../../shared/pipes/currency-vnd.pipe";
import { BookingInfoService } from '../../../services/booking-infor.service';

@Component({
  selector: 'app-tour-booking-confirm',
  imports: [CommonModule, CurrencyVndPipe],
  templateUrl: './tour-booking-confirm.component.html',
  styleUrl: './tour-booking-confirm.component.css'
})
export class TourBookingConfirmComponent {
  isLoading: boolean = true;
  bookingData?: any;


  numberAdults: number = 1;
  numberChildren: number = 0;
  numberInfants: number = 0;
  numberToddlers: number = 0;

  childrenPrice: number = 0;
  infantPrice: number = 0;
  toddlerPrice: number = 0;

  numberSingleRooms: number = 1;

  adultFinalPrice: number =0;
  appliedVoucherCode: string | null = null;

  voucherDiscount = 0;                    // CHANGE: số tiền giảm áp dụng


  constructor(
    private bookingInforService: BookingInfoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  paymentStatus: any;

  ngOnInit(): void {
    // const bookingCode = this.router.url.split('/').pop();

    // console.log(bookingCode)

    const bookingCode = this.route.snapshot.paramMap.get('code')!;
    this.route.queryParams.subscribe(params => {
      this.paymentStatus = params['status']; // 'success' or 'fail'
    });

    if(this.paymentStatus === 'success') {
      this.successMessage = 'Thanh toán thành công';
      this.triggerSuccess()
    } else if(this.paymentStatus === 'fail') {
      this.errorMessage = 'Thanh toán thất bại';
      this.triggerError()
    }

    console.log(this.paymentStatus)

    if(bookingCode) {
      this.getBookingDetailByBookingCode(bookingCode);
    }

  }

  forwardPayment() {
    console.log(this.bookingData.paymentUrl)
    window.location.href = `${this.bookingData.paymentUrl}`;
  }


  getBookingDetailByBookingCode(bookingCode: string) {
  this.bookingInforService.getBookingDetails(bookingCode).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.bookingData = response.data;

      // ====== Số phòng đơn ======
      const adults = Array.isArray(this.bookingData?.adults) ? this.bookingData.adults : []; // change
      this.numberSingleRooms = adults.filter((t: any) => !!t?.singleRoom).length;           // change
      if (this.bookingData?.needHelp) {                                                     // change
        this.numberSingleRooms = this.bookingData?.singleRooms ?? 1;                        // change
      }

      // ====== Số lượng khách theo nhóm ======
      this.numberAdults   = adults.length;                          // change
      this.numberChildren = (this.bookingData?.children ?? []).length;
      this.numberInfants  = (this.bookingData?.infants  ?? []).length;
      this.numberToddlers = (this.bookingData?.toddlers ?? []).length;

      // ====== Tính finalPrice giống trang TourBooking ======
      // ====== Tổng tiền lấy trực tiếp từ API ====== // change
      this.total = Number(this.bookingData?.totalAmount) || 0;             // change                                                                       // change
      this.setExpiredDate();
    },
  });
}

  total: number = 0;


  calculateTotal() {
  const adultPrice    = this.adultFinalPrice || 0;
  const childrenPrice = this.childrenPrice   || Math.round(adultPrice * 0.75);
  const infantPrice   = this.infantPrice     || Math.round(adultPrice * 0.5);
  const toddlerPrice  = this.toddlerPrice    || 500000;

  const adultsArray   = Array.isArray(this.bookingData?.adults)   ? this.bookingData.adults   : [];
  const childrenArray = Array.isArray(this.bookingData?.children) ? this.bookingData.children : [];

  const adultTotal   = adultsArray.length   * adultPrice;
  const childTotal   = childrenArray.length * childrenPrice;
  const infantTotal  = (this.numberInfants  || 0) * infantPrice;
  const toddlerTotal = (this.numberToddlers || 0) * toddlerPrice;

  const extra = (this.numberSingleRooms || 0) * (this.bookingData?.extraHotelCost ?? 0);

  const subtotal = adultTotal + childTotal + infantTotal + toddlerTotal + extra;
  const final    = Math.max(0, subtotal - (this.voucherDiscount || 0));

  this.total = final;
}


  changePaymentMethod() {

    const newMethod = this.bookingData.paymentMethod === 'CASH' ? 'BANKING' : 'CASH';

    console.log(this.bookingData.id)

    this.bookingInforService.changePaymentStatus(this.bookingData.id, newMethod).subscribe({
      next: (response) => {
        console.log(response)




        this.bookingData.paymentMethod = newMethod;
        this.triggerSuccess()
      }, 
      error: (error) => {
        console.log(error)
      }
    })
  }

  expiredDate?:Date;

  setExpiredDate(): void {
    let date = new Date(this.bookingData.createdAt);
    date.setHours(date.getHours() + 2);
    this.expiredDate = date;
    console.log(this.expiredDate)
  }


  range(end: number): number[] {
    return Array.from({ length: end - 0 }, (_, i) => 0 + i);
  }


  showSuccess: boolean = false;
  showError: boolean = false;


  successMessage: string = 'Thay đổi thành công';
  errorMessage: string = 'Thay đổi thất bại';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

  triggerError() {
    this.showError = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
      this.errorMessage = 'Thay đổi thất bại';
    }, 4000);
  }

  get totalGuests(): number {
  return (this.numberAdults || 0)
       + (this.numberChildren || 0)
       + (this.numberInfants || 0)
       + (this.numberToddlers || 0);
}


}
