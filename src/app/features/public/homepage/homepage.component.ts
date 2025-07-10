import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeroSectionComponent } from '../../../shared/components/hero-section/hero-section.component';
import { HomepageService } from '../services/homepage.service';
import { DurationFormatPipe } from "../../../shared/pipes/duration-format.pipe";
import { Router, RouterModule } from '@angular/router';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { IconTransportPipe } from '../../../shared/pipes/icon-transport.pipe';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroSectionComponent,
    DurationFormatPipe,
    CurrencyVndPipe,
    IconTransportPipe,
    SkeletonComponent,

  ],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit {
  blogs: Blog[] = [];
  highlyRatedTours: HighlyRatedTour[] = [];
  locations: Location[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private homepageService: HomepageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) { }

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
  @ViewChildren('scrollRef') scrollContainers!: QueryList<ElementRef>;

  // Scroll trái
  scrollLeft(tourId: number): void {
    const target = this.getScrollContainerByTourId(tourId);
    if (target) {
      target.scrollBy({ left: -100, behavior: 'smooth' });
    }
  }
  
  // Scroll phải
  scrollRight(tourId: number): void {
    const target = this.getScrollContainerByTourId(tourId);
    if (target) {
      target.scrollBy({ left: 100, behavior: 'smooth' });
    }
  }

  // Tìm scroll container ứng với tour id
  private getScrollContainerByTourId(tourId: number): HTMLElement | null {
    const containers = this.scrollContainers.toArray();
    for (let c of containers) {
      const el = c.nativeElement as HTMLElement;
      if (el.dataset['tourId'] === tourId.toString()) {
        return el;
      }
    }
    return null;
  }
  navigateToTour(id: number): void {
  this.router.navigate(['/tours', id]);
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
  departureDates: string[];
  code: string,
  tourTransport: string;


}

interface Location {
  id: number;
  name: string;
  description: string;
  image: string;
}
