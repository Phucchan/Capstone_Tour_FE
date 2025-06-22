import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeroSectionComponent } from '../../../shared/components/hero-section/hero-section.component';
import { HomepageService } from '../services/homepage.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroSectionComponent,
    FooterComponent
  ],
  templateUrl: './homepage.component.html'
})
export class HomepageComponent {
  blogs: Blog[] = [];
  highlyRatedTours: Tour[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private homepageService: HomepageService) {
    this.getHomePageData();
  }

  getHomePageData(): void {
    this.homepageService.getHomePageData().subscribe({
      next: (response) => {
        const data = response.data || {};
        this.blogs = data.recentBlogs || [];
        this.highlyRatedTours = data.highlyRatedTours || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching homepage data', err);
        this.errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
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

interface Tour {
  id: number;
  name: string;
  thumbnailUrl: string;
  averageRating: number;
  durationDays: number;
  region: string;
  locationName: string;
}
