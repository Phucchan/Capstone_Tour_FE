import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd, RouterOutlet } from '@angular/router';
import { SsrService } from '../../../../core/services/ssr.service';
import { Modal } from 'flowbite';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.css'],
  imports: [
    RouterOutlet,
    HeaderComponent,
],
})
export class PublicLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  private mainContent: HTMLElement | null = null;
  private modal: Modal | null = null;

  constructor(
    private router: Router,
    private ssrService: SsrService
  ) {}

  ngOnInit(): void {
    
    const doc = this.ssrService.getDocument();
    
    if (doc) {
      setTimeout(() => {
        this.mainContent = doc.getElementById('main-content');
      }, 100);
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd && this.mainContent && doc.body.classList.contains('modal-open')) {
          this.mainContent.scrollTop = 0;
        }
      });
    }
    
  }

  ngAfterViewInit(): void {
    const doc = this.ssrService.getDocument();
    if (doc) {
      this.mainContent = doc.getElementById('main-content');

      const modalEl = doc.getElementById('default-modal');
      if (modalEl) {
        this.modal = new Modal(modalEl);

        modalEl.addEventListener('show.bs.modal', () => {
          document.body.classList.add('modal-open');
          this.mainContent?.classList.add('overflow-hidden');
        });

        modalEl.addEventListener('hide.bs.modal', () => {
          document.body.classList.remove('modal-open');
          this.mainContent?.classList.remove('overflow-hidden');
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.modal) {
      this.modal.hide();
    }
    
    const doc = this.ssrService.getDocument();
    if(doc){
      doc.body.classList.remove('modal-open');
    }
  }
}