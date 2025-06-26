import { Component, OnInit } from "@angular/core";
import { ListTourService } from "../services/list-tour.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FormatDatePipe } from "../../../shared/pipes/format-date.pipe";
import { CurrencyVndPipe } from "../../../shared/pipes/currency-vnd.pipe";
import { DurationFormatPipe } from "../../../shared/pipes/duration-format.pipe";



@Component({
  standalone: true,
  selector: 'app-list-tour',
  templateUrl: './list-tour.component.html',
  styleUrls: ['./list-tour.component.css'],
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule,
    FormatDatePipe,
    CurrencyVndPipe,
    DurationFormatPipe,
  ]
})

export class ListTourComponent implements OnInit {
  tours: any[] = [];
  total = 0;
  page = 1;
  size = 10;
  sort = 'latest'; // hoặc 'price_asc', 'price_desc'
  isLoading = true;

  constructor(private tourService: ListTourService) { }

  ngOnInit(): void {
    this.fetchTours();
  }

  fetchTours(): void {
    this.isLoading = true;
    this.tourService.getTours({ page: this.page, size: this.size, sort: this.sort }).subscribe({
      next: (response: any) => {
        this.tours = response.data.items;
        this.total = response.data.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching tours:', error);
        this.isLoading = false;
      }
    });
  }

  onSortChange(value: string): void {
    this.sort = value;
    this.fetchTours();
  }
}
interface TourItem {
  id: number;
  name: string;
  thumbnailUrl: string;
  averageRating: number;
  durationDays: number;
  region: string;
  locationName: string;
  startingPrice: number;
  nextDepartureDate: string;
}

interface TourListResponse {
  page: number;
  size: number;
  total: number;
  items: TourItem[];
}
