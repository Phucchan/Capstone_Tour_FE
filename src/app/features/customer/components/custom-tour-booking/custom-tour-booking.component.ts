import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-custom-tour-booking',
  standalone: true,
  imports: [CommonModule, 
    RouterModule, 
    FormsModule],
  templateUrl: './custom-tour-booking.component.html'
})
export class CustomTourBookingComponent {
  booking = {
    hasDestination: false,
    destinationDetail: '',
    startDate: '',
    endDate: '',
    transport: '',
    adult: 1,
    child: 0,
    baby: 0,
    hotelRoomCount: '',
    hotelStandard: '',
    hotelRequirements: {
      smoke: false,
      noSmoke: false,
      kingBed: false,
      twinBed: false,
      singleRoom: false,
      standardRoom: false,
      luxuryRoom: false,
      highFloor: false
    },
    name: '',
    email: '',
    phone: '',
    contactMethod: 'email'
  };

  transports = ['Ô tô', 'Xe khách', 'Máy bay', 'Tàu hoả', 'Khác'];
  roomCounts = [1, 2, 3, 4, 5];
  hotelStandards = ['Tiêu chuẩn', '3 sao', '4 sao', '5 sao'];
  hotelOptions = [
    { value: 'smoke', label: 'Hút thuốc' },
    { value: 'noSmoke', label: 'Không hút thuốc' },
    { value: 'kingBed', label: 'Giường King/Queen' },
    { value: 'twinBed', label: 'Giường đôi' },
    { value: 'singleRoom', label: 'Phòng đơn' },
    { value: 'standardRoom', label: 'Phòng tiêu chuẩn' },
    { value: 'luxuryRoom', label: 'Phòng sang trọng' },
    { value: 'highFloor', label: 'Tầng đặc biệt' },
  ];

  changeGuest(type: 'adult' | 'child' | 'baby', change: number) {
    if (this.booking[type] + change >= 0) {
      this.booking[type] += change;
    }
  }

  submitBooking() {
    // Validate dữ liệu trước khi gửi
    if (!this.booking.name || !this.booking.email || !this.booking.phone) {
      alert('Vui lòng điền đầy đủ thông tin liên hệ!');
      return;
    }
    // TODO: Gọi API hoặc gửi dữ liệu tới server
    alert('Đã gửi thông tin đặt tour thành công!\n' + JSON.stringify(this.booking, null, 2));
  }
}
