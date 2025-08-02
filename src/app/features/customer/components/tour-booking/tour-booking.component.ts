import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TourDetailService } from '../../services/tour-detail.service';
import { BookingInfoService } from '../../services/booking-infor.service';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
import { CustomerService } from '../../services/customer.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-tour-booking',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyVndPipe,
    SpinnerComponent,
  ],
  templateUrl: './tour-booking.component.html',
  styleUrl: './tour-booking.component.css',
  providers: [DatePipe],
})
export class TourBookingComponent implements OnInit {
  tourDetails?: any;
  tourSchedule?: any;
  userInformation: any;
  bookingForm: FormGroup;

  numberAdults: number = 1;
  numberChildren: number = 0;
  numberInfants: number = 0;
  numberToddlers: number = 0;

  childrenPrice: number = 0;
  infantsPrice: number = 0;
  toddlersPrice: number = 500000;

  numberSingleRooms: number = 1;

  isLoading: boolean = true;

  scheduleId: number = 0;
  tourId: number = 0;
  maxDateOfBirth: string = '';
  today: string = '';

  total: number = 0;

  warningMessage: string = '';

  isHelpingInput: boolean = true;

  constructor(
    private bookingInforService: BookingInfoService,
    private fb: FormBuilder,
    private userStorageService: UserStorageService,
    private router: Router,
    private tourDetailService: TourDetailService,
    private customerService: CustomerService,
    private currentUserService: CurrentUserService
  ) {
    this.bookingForm = this.fb.group({
      userId: ['', Validators.required],
      tourId: ['', Validators.required],
      scheduleId: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
      address: ['', Validators.required],
      note: [''],
      paymentMethod: ['CASH', Validators.required],
      adults: this.fb.array([]),
      children: this.fb.array([]),
      infants: this.fb.array([]),
      toddlers: this.fb.array([]),
      total: [0],
      sellingPrice: [0, Validators.required],
      extraHotelCost: [0, Validators.required],
      numberSingleRooms: [1, Validators.required],
      tourName: ['', Validators.required],
    });

    // Dynamically add adult form groups based on numberAdults
    this.addAdults(this.numberAdults);

    this.adultsFormArray.valueChanges.subscribe(() => {
      if (!this.isHelpingInput) {
        this.updateSingleRoomValues();
      }

      this.calculateTotal();
    });
  }

  ngOnInit(): void {
    const tourId = Number(this.router.url.split('/')[2]);
    const scheduleId = Number(this.router.url.split('/')[3]);

    this.tourId = tourId;
    this.scheduleId = scheduleId;

    console.log('{TourBookingComponent} Tour ID:', this.tourId);
    console.log('{TourBookingComponent} Schedule ID:', this.scheduleId);

    this.getTourDetails(tourId);
    this.currentUserService.currentUser$
      .pipe(
        // chỉ lấy khi user có (khác null)
        filter((user: any) => !!user),
        take(1) // chỉ lấy 1 lần
      )
      .subscribe((user) => {
        this.getUserData();
      });

    const today = new Date();
    const twelveYearsAgo = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate()
    );

    this.maxDateOfBirth = twelveYearsAgo.toISOString().split('T')[0];
    this.today = today.toISOString().split('T')[0];
  }

  calculateTotal() {
    const adultsArray = this.adultsFormArray;
    const childrenArray = this.childrenFormArray;

    const adultPrice = this.tourSchedule?.price;
    const childrenPrice = this.childrenPrice;
    const toddlersPrice = this.toddlersPrice;
    const infantsPrice = this.tourSchedule?.price! * 0.5;

    const adultTotal = adultsArray.controls.length * adultPrice!;
    const childrenTotal = childrenArray.controls.length * childrenPrice;
    const infantsTotal = this.numberInfants * infantsPrice;
    const toddlersTotal = this.numberToddlers * toddlersPrice;

    const extra = this.numberSingleRooms * this.tourSchedule?.extraHotelCost!;

    this.total =
      adultTotal + childrenTotal + extra + infantsTotal + toddlersTotal;

    this.bookingForm.patchValue({ total: this.total }, { emitEvent: false });
  }

  updateNumberOfSingleRooms(): void {
    const adultsArray = this.adultsFormArray;
    this.numberSingleRooms = adultsArray.controls.filter(
      (adultGroup) => adultGroup.get('singleRoom')?.value === true
    ).length;
  }

  changeHelpingInput() {
    console.log('{TourBookingComponent} isHelpingInput:', this.isHelpingInput);
    this.isHelpingInput = !this.isHelpingInput;

    if (this.isHelpingInput) {
      this.clearAllPassengerGroups();
    } else {
      this.addAllPassengerGroupValidators();
    }
  }

  createCustomerGroup(isSingleRoom: boolean, paxType: string): FormGroup {
    return this.fb.group({
      fullName: [''],
      gender: ['MALE'],
      dateOfBirth: [''],
      singleRoom: isSingleRoom, // Checkbox value (default: false)
      paxType: [paxType, Validators.required], // Default to ADULT
    });
  }

  // Helper method to create a single adult FormGroup
  createAdultGroup(): FormGroup {
    if (this.isHelpingInput) {
      return this.createCustomerGroup(this.numberAdults == 1, 'ADULT');
    }

    return this.fb.group({
      fullName: ['', Validators.required],
      gender: ['MALE', Validators.required],
      dateOfBirth: ['', Validators.required],
      singleRoom: this.numberAdults == 1 ? [true] : [false], // Checkbox value (default: false)
      paxType: ['ADULT', Validators.required],
    });
  }

  createChildrenGroup(paxType: string): FormGroup {
    if (this.isHelpingInput) {
      return this.createCustomerGroup(false, paxType);
    }
    return this.fb.group({
      fullName: ['', Validators.required],
      gender: ['MALE', Validators.required],
      dateOfBirth: ['', Validators.required],
      singleRoom: [false],
      paxType: [paxType, Validators.required], // Default to CHILD
    });
  }

  clearAllPassengerGroups() {
    console.log(
      '{TourBookingComponent} Clearing all passenger groups validators'
    );

    const groups = ['adults', 'children', 'toddlers', 'infants'];
    groups.forEach((group) => {
      const arr = this.bookingForm.get(group) as FormArray;
      arr.controls.forEach((ctrl) => {
        const fg = ctrl as FormGroup;
        Object.keys(fg.controls).forEach((key) => {
          fg.get(key)?.clearValidators();
          fg.get(key)?.updateValueAndValidity();
        });
      });
      arr.clearValidators();
      arr.updateValueAndValidity();
    });
  }

  addAllPassengerGroupValidators() {
    const groups = ['adults', 'children', 'toddlers', 'infants'];

    groups.forEach((group) => {
      const arr = this.bookingForm.get(group) as FormArray;

      // Thêm validator cho từng field trong mỗi FormGroup
      arr.controls.forEach((ctrl) => {
        const fg = ctrl as FormGroup;

        if (fg.get('fullName')) {
          fg.get('fullName')?.setValidators([Validators.required]);
        }

        if (fg.get('gender')) {
          fg.get('gender')?.setValidators([Validators.required]);
        }

        if (fg.get('dateOfBirth')) {
          fg.get('dateOfBirth')?.setValidators([Validators.required]);
        }

        // Cập nhật lại giá trị và trạng thái
        Object.values(fg.controls).forEach((control) => {
          control.updateValueAndValidity();
        });
      });

      // Thêm validator cho toàn bộ FormArray
      arr.setValidators([Validators.required, Validators.minLength(1)]);
      arr.updateValueAndValidity();
    });
  }

  addAdults(count: number): void {
    const adultsArray = this.adultsFormArray;
    for (let i = 0; i < count; i++) {
      adultsArray.push(this.createAdultGroup());
    }
  }

  addChildren(): void {
    const childrenArray = this.childrenFormArray;
    childrenArray.push(this.createChildrenGroup('CHILD'));
  }

  addInfants(): void {
    const infantsArray = this.infantsFormArray;
    infantsArray.push(this.createChildrenGroup('INFANT'));
  }

  addtoddlers(): void {
    const toddlersArray = this.toddlersFormArray;
    toddlersArray.push(this.createChildrenGroup('TODDLER'));
  }

  updateSingleRoomValues(): void {
    const adultsArray = this.adultsFormArray;
    const isSingleAdult = adultsArray.length === 1;

    adultsArray.controls.forEach((adultGroup) => {
      const singleRoomControl = adultGroup.get('singleRoom');
      if (singleRoomControl) {
        singleRoomControl.setValue(isSingleAdult, { emitEvent: false }); // Set to true if only one adult, otherwise false
      }
    });

    this.bookingForm.patchValue({
      numberSingleRooms: this.numberSingleRooms,
    });
  }

  // Getter for the adults FormArray
  get adultsFormArray(): FormArray {
    return this.bookingForm.get('adults') as FormArray;
  }

  // Getter for the children FormArray
  get childrenFormArray(): FormArray {
    return this.bookingForm.get('children') as FormArray;
  }

  // Getter for the infants FormArray
  get infantsFormArray(): FormArray {
    return this.bookingForm.get('infants') as FormArray;
  }

  // Getter for the toddlers FormArray
  get toddlersFormArray(): FormArray {
    return this.bookingForm.get('toddlers') as FormArray;
  }

  getTourDetails(tourId: number) {
    this.isLoading = true;
    this.tourDetailService.getTourDetails(tourId).subscribe({
      next: (response) => {
        this.tourDetails = response.data;
        this.tourSchedule = this.tourDetails?.schedules?.find(
          (schedule: any) => schedule.id === this.scheduleId
        );
        this.childrenPrice = this.tourSchedule?.price! * 0.75;
        this.infantsPrice = this.tourSchedule?.price! * 0.5;

        this.calculateTotal();

        this.bookingForm.patchValue({
          tourId: this.tourDetails?.id,
          scheduleId: this.tourSchedule?.id,
          sellingPrice: this.tourSchedule?.price,
          extraHotelCost: this.tourSchedule?.extraHotelCost,
          tourName: this.tourDetails?.name,
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load tour details:', error);
        this.isLoading = false;
      },
    });
  }

  getUserData() {
    this.customerService
      .getUserBasic(this.currentUserService.getCurrentUser().username)
      .subscribe({
        next: (response) => {
          this.userInformation = response.data;
          this.bookingForm.patchValue({
            userId: this.userInformation?.id,
            fullName: this.userInformation?.fullName,
            email: this.userInformation?.email,
            phone: this.userInformation?.phone,
            address: this.userInformation?.address,
          });
        },
        error: (error) => {
          console.error('Failed to load user data:', error);
          this.isLoading = false;
        },
      });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const formData = this.bookingForm.value;

      console.log('Form Data:', formData);

      this.isLoading = true;

      this.bookingInforService.submitBooking(formData).subscribe({
        next: (response) => {
          this.router.navigate(['/tour-booking-detail', response.data]);
        },
        error: (error) => {
          console.error('Booking Failed:', error);
          this.warningMessage = 'Failed to create booking. Please try again.';
          this.triggerWarning();
        },
      });
    } else {
      console.log('Form Submitted:', this.bookingForm.value);
      this.warningMessage = 'Please fill in all required fields';
      this.triggerWarning();
      this.bookingForm.markAllAsTouched();
    }
  }

  increamentSingleRooms() {
    if (this.numberSingleRooms < this.numberAdults) {
      this.numberSingleRooms++;
      this.bookingForm.patchValue({
        numberSingleRooms: this.numberSingleRooms,
      });
      this.calculateTotal();
    }
  }

  decrementSingleRooms() {
    if (
      this.numberSingleRooms > 1 ||
      (this.numberAdults > 1 && this.numberSingleRooms > 0)
    ) {
      this.numberSingleRooms--;
      this.calculateTotal();
    } // Prevent negative values
    this.bookingForm.patchValue({
      numberSingleRooms: this.numberSingleRooms,
    });
  }

  incrementAldults() {
    if (
      this.numberAdults +
        this.numberChildren +
        this.numberInfants +
        this.numberToddlers <
      this.tourSchedule?.availableSeats!
    ) {
      this.numberAdults++;
      this.addAdults(1);
      if (!this.isHelpingInput) {
        this.updateSingleRoomValues();
      }
      this.calculateTotal();
    } else {
      this.warningMessage =
        'Sorry, the current tour has only ' +
        this.tourSchedule?.availableSeats +
        ' seats left.';
      this.triggerWarning();
    }
  }

  decrementAldults() {
    if (this.numberAdults > 1) {
      this.numberAdults--;
      this.adultsFormArray.removeAt(this.numberAdults); // Remove the last adult form group

      if (this.numberAdults < this.numberSingleRooms) {
        this.numberSingleRooms = this.numberAdults; // Adjust single rooms if needed
      }

      if (!this.isHelpingInput) {
        this.updateSingleRoomValues();
      }
      this.calculateTotal();
    } // Prevent negative values
  }

  incrementChildren() {
    if (
      this.numberAdults +
        this.numberChildren +
        this.numberInfants +
        this.numberToddlers <
      this.tourSchedule?.availableSeats!
    ) {
      this.numberChildren++;
      this.addChildren();
      this.calculateTotal();
    } else {
      this.warningMessage =
        'Sorry, the current tour has only ' +
        this.tourSchedule?.availableSeats +
        ' seats left.';
      this.triggerWarning();
    }
  }

  decrementChildren() {
    if (this.numberChildren > 0) {
      this.numberChildren--;
      this.childrenFormArray.removeAt(this.numberChildren); // Remove the last children form group
      this.calculateTotal();
    } // Prevent negative values
  }

  incrementInfants() {
    if (
      this.numberAdults +
        this.numberChildren +
        this.numberInfants +
        this.numberToddlers <
      this.tourSchedule?.availableSeats!
    ) {
      this.numberInfants++;
      this.addInfants();
      this.calculateTotal();
    } else {
      this.warningMessage =
        'Sorry, the current tour has only ' +
        this.tourSchedule?.availableSeats +
        ' seats left.';
      this.triggerWarning();
    }
  }

  decrementInfants() {
    if (this.infantsFormArray.length > 0) {
      this.numberInfants--;
      this.infantsFormArray.removeAt(this.numberInfants);
      this.calculateTotal();
    } // Prevent negative values
  }

  incrementToddlers() {
    if (
      this.numberAdults +
        this.numberChildren +
        this.numberInfants +
        this.numberToddlers <
      this.tourSchedule?.availableSeats!
    ) {
      this.numberToddlers++;
      this.addtoddlers();
      this.calculateTotal();
    } else {
      this.warningMessage =
        'Sorry, the current tour has only ' +
        this.tourSchedule?.availableSeats +
        ' seats left.';
      this.triggerWarning();
    }
  }

  decrementToddlers() {
    if (this.toddlersFormArray.length > 0) {
      this.numberToddlers--;
      this.toddlersFormArray.removeAt(this.numberToddlers);
      this.calculateTotal();
    } // Prevent negative values
  }

  showWarning: boolean = false;

  triggerWarning() {
    this.showWarning = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showWarning = false;
    }, 4000);
  }

  range(end: number): number[] {
    return Array.from({ length: end - 0 }, (_, i) => 0 + i);
  }

  agreeTerms: boolean = false;

  confirmAgreeTerms() {
    this.agreeTerms = !this.agreeTerms;
  }
}
