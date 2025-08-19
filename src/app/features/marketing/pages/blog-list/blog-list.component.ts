import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

// NG-ZORRO Imports
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider'; // SỬA LỖI 2: Thêm NzDividerModule

import { BlogManagementService } from '../../services/blog-management.service';
import { BlogManagerDTO, PagingDTO } from '../../models/blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzAvatarModule,
    NzTagModule,
    NzDropDownModule,
    NzPopconfirmModule,
    NzDividerModule, // SỬA LỖI 2: Thêm NzDividerModule
  ],
  templateUrl: './blog-list.component.html',
})
export class BlogListComponent implements OnInit {
  // Injected services
  private blogService = inject(BlogManagementService);
  private router = inject(Router);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

  // Component state
  blogPaging: PagingDTO<BlogManagerDTO> = {
    items: [],
    page: 0,
    size: 10,
    total: 0,
  };
  isLoading = true;

  ngOnInit(): void {
    // Initial data load is handled by onQueryParamsChange
  }

  loadBlogs(page: number, size: number): void {
    this.isLoading = true;
    this.blogService
      .getBlogs(page, size)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.blogPaging = response.data;
          } else {
            this.message.error(
              response.message || 'Không thể tải danh sách bài viết.'
            );
          }
        },
        error: (err) => {
          this.message.error(
            err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
          );
          console.error(err);
        },
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    // pageIndex in nz-table is 1-based, API is 0-based
    this.loadBlogs(pageIndex - 1, pageSize);
  }

  // SỬA LỖI 3: Bỏ 'private' để template có thể truy cập
  deleteBlog(blogId: number): void {
    this.blogService.deleteBlog(blogId).subscribe({
      next: (response) => {
        this.message.success(response.message || 'Xóa bài viết thành công!');
        // Reload data at current page
        this.loadBlogs(this.blogPaging.page, this.blogPaging.size);
      },
      error: (err) => {
        this.message.error(err.error?.message || 'Xóa bài viết thất bại.');
        console.error(err);
      },
    });
  }

  goToCreatePage(): void {
    this.router.navigate(['/marketing/blogs/create']);
  }

  goToEditPage(blogId: number): void {
    this.router.navigate(['/marketing/blogs/edit', blogId]);
  }

  handleImageError(event: any): void {
    event.target.src = 'https://placehold.co/40x40/e2e8f0/475569?text=IMG';
  }
}
