/*
================================================================
File: src/app/features/marketing/pages/blog-list/blog-list.component.ts
Description: Component logic for displaying and managing the list of blogs.
================================================================
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlogManagementService } from '../../services/blog-management.service';
import { BlogManagerDTO, PagingDTO } from '../../models/blog.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-list.component.html',
})
export class BlogListComponent implements OnInit {
  blogPaging: PagingDTO<BlogManagerDTO> | null = null;
  isLoading = false;
  error: string | null = null;

  currentPage = 0;
  pageSize = 10;

  constructor(
    private blogService: BlogManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.isLoading = true;
    this.error = null;
    this.blogService
      .getBlogs(this.currentPage, this.pageSize)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response && response.statusCode === 200) {
            this.blogPaging = response.data;
          } else {
            this.error =
              response.message || 'Không thể tải danh sách bài viết.';
          }
        },
        error: (err) => {
          this.error = 'Đã xảy ra lỗi. Vui lòng thử lại.';
          console.error(err);
        },
      });
  }

  onDelete(blogId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      this.isLoading = true;
      this.blogService
        .deleteBlog(blogId)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            if (response.statusCode === 200) {
              this.loadBlogs();
            } else {
              this.error = response.message;
            }
          },
          error: (err) => {
            this.error = 'Xóa bài viết thất bại. Vui lòng thử lại.';
            console.error(err);
          },
        });
    }
  }

  goToCreatePage(): void {
    this.router.navigate(['/marketing/blogs/new']); // Adjusted route
  }

  goToEditPage(blogId: number): void {
    this.router.navigate(['/marketing/blogs/edit', blogId]); // Adjusted route
  }

  onPageChange(page: number): void {
    if (
      page >= 0 &&
      (!this.blogPaging ||
        page < Math.ceil(this.blogPaging.total / this.pageSize))
    ) {
      this.currentPage = page;
      this.loadBlogs();
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'https://placehold.co/40x40/e2e8f0/475569?text=IMG';
  }
}
