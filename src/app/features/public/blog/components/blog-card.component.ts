// src/app/features/blog/components/blog-card.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router'; // Import RouterModule
import { BlogItem } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-blog-card',
  standalone: true, // Đánh dấu đây là Standalone Component
  imports: [
    CommonModule, // Cần cho *ngFor, *ngIf...
    RouterModule, // Cần cho routerLink
    DatePipe      // Cần cho pipe 'date'
  ],
  templateUrl: './blog-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogCardComponent {
  @Input() blogItem!: BlogItem;
}
