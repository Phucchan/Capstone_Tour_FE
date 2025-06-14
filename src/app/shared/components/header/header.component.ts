import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SsrService } from '../../../core/services/ssr.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('searchDropdown') searchDropdownRef!: ElementRef;

  isScrolled = false;
  private mainContent: HTMLElement | null | undefined;
  isLoggedIn: boolean = false;
  username: string = '';
  isHomepage: boolean = false;
  listLocation: any[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private userStorageService: UserStorageService,
    private ssrService: SsrService,
    public router: Router
  ) {
    
  }

  ngOnInit(): void {
    this.isHomepage = this.router.url === '/homepage' || this.router.url === '/';

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.isHomepage = this.router.url === '/homepage' || this.router.url === '/';
      }
    });

    if (this.ssrService.getDocument()) {
      const doc = this.ssrService.getDocument();
      if (doc) {
        doc.addEventListener('show.bs.modal', () => {
          doc.body.classList.add('no-scroll');
        });

        doc.addEventListener('hide.bs.modal', () => {
          doc.body.classList.remove('no-scroll');
        });
      }
    }
  }



  toggleDropdown() {
    const dropdown = document.getElementById('dropdownLocation');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  }

  goHomepage(): void {
    this.router.navigate(['/homepage']);
  }

  openHistory(): void {
    this.router.navigate(['/customer/booking-history']);
  }

  ngAfterViewInit() {
    if (this.ssrService.isBrowser) {
      this.mainContent = document.getElementById('main-content');
      if (this.mainContent) {
        this.mainContent.addEventListener('scroll', this.onScroll);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.ssrService.isBrowser) {
      if (this.mainContent) {
        this.mainContent.removeEventListener('scroll', this.onScroll);
      }
      document.removeEventListener('show.bs.modal', () => { });
      document.removeEventListener('hide.bs.modal', () => { });
    }
    this.searchSubject.unsubscribe(); // Hủy subscription khi component destroy
  }

  onScroll = () => {
    if (this.ssrService.isBrowser) {
      if (this.mainContent && this.isHomepage) {
        const isModalOpen = document.body.classList.contains('modal-open');
        if (!isModalOpen) {
          const scrollPosition = this.mainContent.scrollTop;
          this.isScrolled = scrollPosition > 300;
        }
      }
    }
  };

  onLogout() {
    UserStorageService.signOut(this.userStorageService);
    this.isLoggedIn = false;
    this.router.navigate(['/homepage']);
  }
}