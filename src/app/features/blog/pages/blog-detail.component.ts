// src/app/features/blog/pages/blog-detail.component.ts

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { BlogService } from '../../../core/services/blog.service';
import { BlogDetail } from '../../../core/models/blog.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './blog-detail.component.html',
})
export class BlogDetailComponent implements OnInit {
  blogDetail$!: Observable<BlogDetail>;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.blogDetail$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.blogService.getBlogById(id);
      })
    );

    // Cuộn lên đầu trang khi component được khởi tạo
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  }
}