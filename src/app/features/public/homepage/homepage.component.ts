import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeroSectionComponent } from '../../../shared/components/hero-section/hero-section.component';
import { HomepageService } from '../services/homepage.service';
import { DurationFormatPipe } from "../../../shared/pipes/duration-format.pipe";
import { RouterModule } from '@angular/router';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroSectionComponent,
    DurationFormatPipe,
    CurrencyVndPipe,
    FormatDatePipe,

  ],
  templateUrl: './homepage.component.html',
})
export class HomepageComponent implements OnInit {
  blogs: Blog[] = [];
  highlyRatedTours: HighlyRatedTour[] = [];
  locations: Location[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private homepageService: HomepageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getHomePageData();
    }
  }

  getHomePageData(): void {
    this.homepageService.getHomePageData().subscribe({
      next: (response) => {
        const data = response.data || {};
        this.blogs = data.recentBlogs || [];
        this.highlyRatedTours = data.highlyRatedTours || [];
        this.locations = data.locations || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching homepage data', err);
        this.errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
        this.isLoading = false;
      },
    });
  }

  getTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }
}

interface Blog {
  id: number;
  title: string;
  thumbnailImageUrl: string | null;
  authorName: string;
  createdAt: string;
}

interface HighlyRatedTour {
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

interface Location {
  id: number;
  name: string;
  description: string;
  image: string;
}
