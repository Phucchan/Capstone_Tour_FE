import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { DurationFormatPipe } from '../../../shared/pipes/duration-format.pipe';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { TourDetailService } from '../services/tour-detail.service';


@Component({
  selector: 'app-tour-detail',
  standalone: true,
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.css'],
  imports: [
    CommonModule,
    CurrencyVndPipe,
    DurationFormatPipe,
    FormatDatePipe,
  ]
})
export class TourDetailComponent implements OnInit {
  tour: TourDetail | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private tourService: TourDetailService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.tourService.getTourDetail(id).subscribe({
        next: (res) => {
          this.tour = res.data;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Không thể tải thông tin tour';
          this.isLoading = false;
        }
      });
    }
  }
}







 interface TourDetail {
  id: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  durationDays: number;
  region: string;
  tourThemeName: string;
  averageRating: number;
  days: TourDay[];
  feedback: Feedback[];
  schedules: Schedule[];
}

 interface TourDay {
  dayNumber: number;
  title: string;
  description: string;
  locationName: string;
  services: TourService[];
}

interface TourService {
  name: string;
  type: string;
  imageUrl: string;
}

 interface Feedback {
  rating: number;
  comment: string;
  userName: string;
  userAvatarUrl: string;
  createdAt: string;
}

 interface Schedule {
  id: number;
  departureDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
}
