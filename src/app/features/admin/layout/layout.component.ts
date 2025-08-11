import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-layout',
  // QUAN TRỌNG: Component này không phải là 'standalone: true'
  // Nếu nó là một phần của NgModule (ví dụ: AdminModule), bạn cần khai báo nó trong module đó.
  // Giả sử nó là standalone để sửa lỗi, chúng ta cần thêm 'standalone: true' và 'imports'.
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminSidebarComponent,
    AdminHeaderComponent,
  ],
  templateUrl: './layout.component.html',
  // styleUrl không phải là thuộc tính hợp lệ, nên dùng 'styleUrls'
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  private mainContent: HTMLElement | null = null;

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
    }
  }
}
