// src/app/features/blog/pages/blog-list.component.ts

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { BlogService } from '../../../core/services/blog.service';
import { BlogPaginationData, BlogItem } from '../../../core/models/blog.model';

import { BlogCardComponent } from '../components/blog-card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    BlogCardComponent,
    SpinnerComponent,
    PaginationComponent,
  ],
  templateUrl: './blog-list.component.html',
})
export class BlogListComponent implements OnInit {
  blogs: BlogItem[] = [];
  totalItems = 0;
  page = 0; // Luôn sử dụng 0-based index, giống hệt list-tour.component.ts
  pageSize = 6; // Bạn có thể đổi số này, ví dụ 6 blog/trang
  isLoading = true;

  constructor(
    private blogService: BlogService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    this.isLoading = true;
    this.blogService.getBlogs(this.page, this.pageSize).subscribe({
      next: (response: BlogPaginationData) => {
        this.blogs = response.items;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.isLoading = false;
      },
    });
  }

  // Hàm này nhận trực tiếp chỉ số trang (0-based) từ component con
  onPageChange(newPage: number): void {
    this.page = newPage;
    this.fetchBlogs();

    // Cuộn lên đầu trang một cách an toàn
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  }
}