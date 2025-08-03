import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomOrderTourService } from '../../services/custom-order-tour.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-custom-order-tour',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-order-tour.component.html',
})
export class CustomOrderTourComponent implements OnInit {
  booking: any = {
    departureLocationId: null,
    destination: '',
    destinationDetail: '',
    startDate: '',
    endDate: '',
    transport: '',
    adults: 1,
    children: 0,
    infants: 0,
    hotelRooms: '',
    roomCategory: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    priceMin: 0,
    priceMax: 0,
  };

  transports = ['CAR', 'PLANE', 'TRAIN'];
  roomCounts = [1, 2, 3, 4, 5];
  hotelStandards = ['standard', 'deluxe', 'vip'];

  destinations: any[] = [];
  departures: any[] = [];

  constructor(
    private tourService: CustomOrderTourService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.loadDepartures();
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

  changeGuest(type: string, delta: number) {
    if (type === 'adults' && this.booking.adults + delta >= 1) {
      this.booking.adults += delta;
    }
    if (type === 'children' && this.booking.children + delta >= 0) {
      this.booking.children += delta;
    }
    if (type === 'infants' && this.booking.infants + delta >= 0) {
      this.booking.infants += delta;
    }
  }

  submitBooking() {
    const payload = { ...this.booking, userId: 0 };

    this.tourService.requestBooking(payload).subscribe({
      next: () => {
        this.toastr.success('Yêu cầu đặt tour đã được gửi thành công!');
      },
      error: () => {
        this.toastr.error('Gửi yêu cầu thất bại!');
      }
    });
  }
}
