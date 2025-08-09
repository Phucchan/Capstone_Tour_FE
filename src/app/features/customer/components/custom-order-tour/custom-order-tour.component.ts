import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomOrderTourService } from '../../services/custom-order-tour.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { IconTransportPipe } from '../../../../shared/pipes/icon-transport.pipe';
import { CurrentUserService } from '../../../../core/services/user-storage/current-user.service';
@Component({
  selector: 'app-custom-order-tour',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    IconTransportPipe,
    ReactiveFormsModule
  ],
  templateUrl: './custom-order-tour.component.html',
})
export class CustomOrderTourComponent implements OnInit {
  bookingForm!: FormGroup;

  transports = ['CAR', 'PLANE', 'TRAIN'];
  hotelStandards = ['standard', 'deluxe', 'vip'];

  destinations: any[] = [];
  departures: any[] = [];

  constructor(
    private tourService: CustomOrderTourService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private currentUserService: CurrentUserService
  ) {}

   ngOnInit(): void {
    this.buildForm();
    this.loadDestinations();
    this.loadDepartures();
    this.fillCurrentUser();
  }
  
  fillCurrentUser() {
  const user = this.currentUserService.getCurrentUser(); // đã login
  if (user) {
    this.bookingForm.patchValue({
      customerName: user.fullName || '',
      customerEmail: user.email || '',
      customerPhone: user.phone || '',
    });
  }
}

   buildForm(): void {
    this.bookingForm = this.fb.group({
      destinationLocationIds: [[], Validators.required],
      departureLocationId: [null, Validators.required],
      destinationDetail: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      transport: ['', Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]],
      infants: [0, [Validators.required, Validators.min(0)]],
      toddlers: [0, [Validators.required, Validators.min(0)]],
      hotelRooms: [1, [Validators.required, Validators.min(1)]],
      roomCategory: ['', Validators.required],
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      priceMin: [0],
      priceMax: [0, [Validators.required, Validators.min(0)]],
    });
  }


  loadDestinations() {
    this.tourService.getDestinations().subscribe(res => {
      this.destinations = res.data;
    });
  }

  loadDepartures() {
    this.tourService.getDepartures().subscribe(res => {
      this.departures = res.data;
    });
  }

  // changeGuest(type: string, delta: number) {
  //   if (type === 'adults' && this.booking.adults + delta >= 1) {
  //     this.booking.adults += delta;
  //   }
  //   if (type === 'children' && this.booking.children + delta >= 0) {
  //     this.booking.children += delta;
  //   }
  //   if (type === 'infants' && this.booking.infants + delta >= 0) {
  //     this.booking.infants += delta;
  //   }
  //   if (type === 'toddlers' && this.booking.toddlers + delta >= 0) {
  //     this.booking.toddlers += delta;
  //   }
  // }

  getTotalGuests(): number {
    const { adults, children, infants, toddlers } = this.bookingForm.value;
    return (adults || 0) + (children || 0) + (infants || 0) + (toddlers || 0);
  }

formatCurrency(value: number): string {
  return value?.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) || '';
}

onPriceInput(event: Event, type: 'min' | 'max') {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/[^\d]/g, '');
    const parsed = parseInt(raw, 10) || 0;

    if (type === 'min') {
      this.bookingForm.patchValue({ priceMin: parsed });
    } else {
      this.bookingForm.patchValue({ priceMax: parsed });
    }

    input.value = this.formatCurrency(parsed);
  }



  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.toastr.warning('Vui lòng điền đầy đủ thông tin yêu cầu');

      return;
    }

    const payload = {
      ...this.bookingForm.value,
        userId: this.currentUserService.getCurrentUser()?.id || 0,
    };
    console.log('Payload gửi đi:', payload); // 👈 THÊM DÒNG NÀY

    this.tourService.requestBooking(payload).subscribe({
      next: () => this.toastr.success('Gửi yêu cầu thành công!'),
      error: () => this.toastr.error('Gửi yêu cầu thất bại'),
    });
  }

  // Helper để lấy control trong template
  get f() {
    return this.bookingForm.controls;
  }
}
