import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StyleManagerService } from '../../../core/services/style-manager.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminSidebarComponent,
    AdminHeaderComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  private mainContent: HTMLElement | null = null;
  private styleManager = inject(StyleManagerService);

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (isPlatformBrowser(this.platformId) && this.mainContent) {
          this.mainContent.scrollTop = 0;
        }
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.mainContent = document.getElementById('main-content');
      // Tải CSS khi component được tạo
      this.styleManager.loadStyle('ng-zorro-antd.min.css');
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Gỡ bỏ CSS khi component bị hủy (ví dụ: khi logout)
      this.styleManager.removeStyle('ng-zorro-antd.min.css');
    }
  }
}
