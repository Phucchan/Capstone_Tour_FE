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
        FooterComponent,
        HeroSectionComponent,

    ],
    templateUrl: './homepage.component.html',

})
export class HomepageComponent {
    blogs: any[] = [];

    constructor(private homepageService: HomepageService) {
        this.getHomePageData();
    }

    getHomePageData() {
        this.homepageService.getHomePageData().subscribe(
            {
                next: (response) => {
                    this.blogs = response.data.recentBlogs || [];
                },
                error: (error) => {
                    console.error('Error fetching home page data:', error);
                }
            }
        );
    }
    getTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    }
}
