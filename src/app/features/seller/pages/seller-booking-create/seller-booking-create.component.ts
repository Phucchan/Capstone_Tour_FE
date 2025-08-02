import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TourService } from '../../../../core/services/tour.service';
import { TourListItem } from '../../../../core/models/tour.model';
import { PagingDTO } from '../../../../core/models/paging.model';
import { TourDepartureService } from '../../../../core/services/tour-departure.service';
import { TourSchedule } from '../../../../core/models/tour-schedule.model';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { SellerBookingService } from '../../services/seller-booking.service';
import { SellerBookingCreateRequest } from '../../models/seller-booking-create-request.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-seller-booking-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SpinnerComponent,
    FormatDatePipe,
    CurrencyVndPipe,
  ],
  templateUrl: './seller-booking-create.component.html',
})
export class SellerBookingCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private tourService = inject(TourService);
  private tourDepartureService = inject(TourDepartureService);
  private sellerBookingService = inject(SellerBookingService);

  currentStep = 1;
  bookingForm: FormGroup;

  // Step 1: Tour Selection
  tourSearchTerm = this.fb.control('');
  tourSearchResults: TourListItem[] = [];
  isSearchingTours = false;
  selectedTour: TourListItem | null = null;

  // Step 2: Schedule Selection
  availableSchedules: TourSchedule[] = [];
  isLoadingSchedules = false;

  // Step 4: Submission
  isSubmitting = false;

  constructor() {
    this.bookingForm = this.fb.group({
      // Step 1 & 2
      tourId: [null, Validators.required],
      scheduleId: [null, Validators.required],
      // Step 3
      bookerInfo: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        address: ['', Validators.required],
      }),
      customers: this.fb.array([], Validators.required),
      // Step 4
      paymentMethod: ['VNPAY', Validators.required],
      note: [''],
    });
  }

  ngOnInit(): void {
    this.tourSearchTerm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term || term.length < 2) {
            this.tourSearchResults = [];
            return of(null);
          }
          this.isSearchingTours = true;
          const params = { page: 0, size: 10, name: term };
          return this.tourService.getTours(params).pipe(
            catchError(() => {
              this.isSearchingTours = false;
              return of(null);
            })
          );
        })
      )
      .subscribe((response: PagingDTO<TourListItem> | null) => {
        //Nhận về PagingDTO thay vì ApiResponse
        this.isSearchingTours = false;
        //Truy cập trực tiếp vào items
        this.tourSearchResults = response?.items || [];
      });
  }

  // --- FormArray Getters & Methods ---
  get bookerInfo(): FormGroup {
    return this.bookingForm.get('bookerInfo') as FormGroup;
  }
  get customers(): FormArray {
    return this.bookingForm.get('customers') as FormArray;
  }
  createCustomerFormGroup(): FormGroup {
    return this.fb.group({
      fullName: ['', Validators.required],
      gender: ['MALE', Validators.required],
      dateOfBirth: ['', Validators.required],
      paxType: ['ADULT', Validators.required],
      singleRoom: [false],
    });
  }
  addCustomer(): void {
    this.customers.push(this.createCustomerFormGroup());
  }
  removeCustomer(index: number): void {
    this.customers.removeAt(index);
  }

  // --- Step Navigation ---
  nextStep(): void {
    if (this.currentStep === 1 && this.bookingForm.get('tourId')?.valid) {
      this.currentStep++;
    } else if (
      this.currentStep === 2 &&
      this.bookingForm.get('scheduleId')?.valid
    ) {
      this.currentStep++;
      if (this.customers.length === 0) {
        // Add one customer by default
        this.addCustomer();
      }
    } else if (
      this.currentStep === 3 &&
      this.bookerInfo.valid &&
      this.customers.valid
    ) {
      this.currentStep++;
    }
  }
  prevStep(): void {
    this.currentStep--;
  }

  // --- Step 1 Logic ---
  selectTour(tour: TourListItem): void {
    this.selectedTour = tour;
    this.bookingForm.get('tourId')?.setValue(tour.id);
    this.tourSearchResults = [];
    this.tourSearchTerm.setValue(tour.name, { emitEvent: false });
    this.loadSchedulesForTour(tour.id);
    this.nextStep();
  }

  // --- Step 2 Logic ---
  loadSchedulesForTour(tourId: number): void {
    this.isLoadingSchedules = true;
    this.availableSchedules = [];
    this.bookingForm.get('scheduleId')?.setValue(null);
     this.tourDepartureService.getTourSchedules(tourId).subscribe({
       // Nhận về trực tiếp mảng TourSchedule[]
       next: (schedules: TourSchedule[]) => {
         this.availableSchedules = schedules;
         this.isLoadingSchedules = false;
       },
       error: () => (this.isLoadingSchedules = false),
     });
  }
  selectSchedule(scheduleId: number): void {
    this.bookingForm.get('scheduleId')?.setValue(scheduleId);
  }

  // --- Step 4 Logic: Final Submission ---
  onSubmit(): void {
    if (this.bookingForm.invalid) {
      alert('Vui lòng kiểm tra lại thông tin đã nhập.');
      return;
    }
    this.isSubmitting = true;
    const formValue = this.bookingForm.value;

    const requestData: SellerBookingCreateRequest = {
      tourId: formValue.tourId,
      scheduleId: formValue.scheduleId,
      note: formValue.note,
      paymentMethod: formValue.paymentMethod,
      fullName: formValue.bookerInfo.fullName,
      email: formValue.bookerInfo.email,
      phone: formValue.bookerInfo.phone,
      address: formValue.bookerInfo.address,
      customers: formValue.customers,
    };

    this.sellerBookingService.createBooking(requestData).subscribe({
      next: (res: ApiResponse<string>) => {
        this.isSubmitting = false;
        alert('Tạo booking thành công!');
        this.router.navigate(['/seller/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(`Lỗi: ${err.error.message || 'Không thể tạo booking.'}`);
      },
    });
  }

  // --- Helper Getters for Template ---
  get selectedSchedule(): TourSchedule | undefined {
    const id = this.bookingForm.get('scheduleId')?.value;
    return this.availableSchedules.find((s) => s.id === id);
  }
}
