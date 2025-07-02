import { CommonModule } from '@angular/common';
import { Component ,Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
  standalone: true,
})
export class SkeletonComponent {
  @Input() isLoading = false;
  @Input() showHeader = true;
  @Input() showImageSection = true;
  @Input() showPriceBox = true;
  @Input() showCalendar = true;
  @Input() showSchedule = true;
  @Input() showImportantInfo = true;
  @Input() showOtherTours = true;
}
