import { Component, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { TourDetailService } from '../services/tour-detail.service';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SsrService } from '../../../core/services/ssr.service';
import { DurationFormatPipe } from '../../../shared/pipes/duration-format.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; 

@Component({
  selector: 'app-tour-detail',
  imports: [FullCalendarModule,
    CommonModule,
    CurrencyVndPipe,
    TruncatePipe,
    DurationFormatPipe,
  ],
  standalone: true,
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.css'],
  providers: [DatePipe]
})
export class TourDetailComponent {
  tourDetails: any | undefined;
  isLoading = true;
  events: { scheduleId: number; title: string; start: string; }[] | undefined = [];
  uniqueMonths = new Set<string>();
  selectedSchedule: any | undefined;
  price: number | undefined;
  isBrowser: boolean = false;
  selectedRange: string[] = [];
  openDays = new Set<number>();           // CHANGE: lưu các index ngày đang mở
  isShow = false;
  // CHANGE: state điều khoản
  policiesLoading = true;              // CHANGE
  policy: {                            // CHANGE
    tourPolicy?: string;               // CHANGE
    cancellationPolicy?: string;       // CHANGE
    bookingPolicy?: string;            // CHANGE
    tourPrice?: string;                // CHANGE
  } | null = null;                     // CHA
  // Toggle accordion
  policyOpen = {                                                        // CHANGE
    tour: false,                                                        // CHANGE
    booking: false,                                                     // CHANGE
    cancel: false,                                                      // CHANGE
    price: false,                                                       // CHANGE
  };                 


  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'vi',
    events: this.events,
    themeSystem: 'bootstrap',
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    dateClick: (arg) => this.handleDateClick(arg),
  };

  userId: number | null;

  constructor(
    private tourDetailService: TourDetailService,
    private router: Router,
    private datePipe: DatePipe,
    private viewportScroller: ViewportScroller,
    private userStorageService: UserStorageService,
    private ssrService: SsrService,
     private sanitizer: DomSanitizer     
  ) {

    this.userId = this.userStorageService.getUserId();
    this.isBrowser = this.ssrService.isBrowser;

  }

  ngOnInit(): void {
    const tourId = Number(this.router.url.split('/').pop());
    if (tourId) {
      this.tourDetailService.getTourDetail(tourId).subscribe({
        next: (response) => {
          this.tourDetails = response.data;
          this.tourDetails?.days?.sort((a: any, b: any) => a.id - b.id);
          // CHANGE: mở mặc định ngày đầu tiên nếu có
          if (this.tourDetails?.days?.length) {                            // CHANGE
            this.openDays.add(0);                                          // CHANGE
          }                 

          this.events = this.tourDetails?.schedules.map((schedule: any) => {
            const final = this.priceAfterDiscount(schedule.price, schedule.discountPercent);
            const title = schedule.discountPercent                                         // CHANGE
              ? `${Math.round(final / 1000)}K (-${schedule.discountPercent}%)`            // CHANGE
              : `${Math.round(schedule.price / 1000)}K`;
            return {
              scheduleId: schedule.id,
              title: '',
              start: schedule.departureDate?.split('T')[0],// Extract only YYYY-MM-DD
              classNames: schedule.discountPercent ? ['fc-discount'] : [],
              extendedProps: {
                basePrice: schedule.price,
                finalPrice: final,
                discountPercent: schedule.discountPercent || 0,
              },
            };
          });

          // "Giá từ" lấy min theo giá đã giảm
          if (this.tourDetails?.schedules?.length) {
            this.price = Math.min(                                                        // CHANGE
              ...this.tourDetails.schedules.map((s: any) =>                               // CHANGE
                this.priceAfterDiscount(s.price, s.discountPercent)                        // CHANGE
              )                                                                            // CHANGE
            );                                                                             // CHANGE
          }

          const initialDate = this.events?.length ? this.events[0].start : new Date().toISOString().split("T")[0];
          this.calendarOptions = {
            ...this.calendarOptions,
            events: [...this.events!],
            initialDate: initialDate,
            eventContent: (arg) => {
              const p: any = arg.event.extendedProps || {};
              const hasDiscount = p.discountPercent && p.discountPercent > 0;
              const baseK = Math.round((p.basePrice || 0) / 1000) + 'K';
              const finalK = Math.round((p.finalPrice || 0) / 1000) + 'K';

              const html = hasDiscount
                ? `<div class="cal-event has-discount">
           <span class="cal-price">${finalK}</span>
           <span class="discount-badge">-${p.discountPercent}%</span>
         </div>`
                : `<div class="cal-event no-discount">
           <span class="cal-price">${finalK || baseK}</span>
         </div>`;

              return { html };
            },
          };

          this.tourDetails?.schedules.forEach((schedule: any) => {
            const formattedDate = this.datePipe.transform(schedule.departureDate, 'MM/yyyy');
            if (formattedDate) {
              this.uniqueMonths.add(formattedDate);
            }
          });

          this.isLoading = false;

        },
        error: (err) => {
          console.error('Failed to load tour:', err);
          this.isLoading = false;
        }
      });
       this.tourDetailService.getPolicies().subscribe({                    // CHANGE
      next: (res) => {                                                  // CHANGE
        const first = Array.isArray(res?.data) ? res.data[0] : res?.data; // CHANGE
        this.policy = first ?? null;                                     // CHANGE
        this.policiesLoading = false;                                    // CHANGE
      },                                                                 // CHANGE
      error: () => { this.policiesLoading = false; }                     // CHANGE
    });                                                                  // CHANGE
  
    } else {
      console.error('Invalid tour id');
      this.isLoading = false;
    }
  }

  // addToWishlist(tour: any) {
  //   this.homepageService.addWishlist(tour).subscribe({
  //     next: (response) => {
  //       if (response.code === 200) {
  //         this.wishlistService.triggerWishlistUpdate();
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error adding to wishlist:', err);
  //     },
  //   });
  // }


  // ========= helpers =========
  priceAfterDiscount(price: number, discount?: number): number {      // CHANGE
    if (!discount || discount <= 0) return price;                              // CHANGE
    return Math.floor(price * (100 - discount) / 100);                         // CHANGE
  }

  scrollToSchedule(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }


  handleDateClick(arg: any) {
    const eventOnDate = this.events?.find(event => event.start === arg.dateStr);
    if (eventOnDate) {
      this.selectedSchedule = this.tourDetails?.schedules?.find((schedule: any) => schedule.id === eventOnDate.scheduleId);

      // Tính toán các ngày cần bôi đen
      const startDate = new Date(arg.dateStr);
      const duration = this.tourDetails?.durationDays || 0;
      this.selectedRange = [];
      for (let i = 0; i < duration; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        this.selectedRange.push(date.toISOString().split('T')[0]);
      }

      // Cập nhật lại background event cho calendar

      this.calendarOptions = {
        ...this.calendarOptions,
        events: [
          ...(this.events || []),
          ...this.selectedRange.map(dateStr => ({
            start: dateStr,
            display: 'background',
            backgroundColor: '#1d4ed8',
            ...this.selectedRange.map(dateStr => ({
              start: dateStr,
              allDay: true,
              display: 'auto',
              title: '',
              classNames: ['selected-day-border'],
            }))
          })),
        ]
      };
    }
  }


  resetSchedule() {
    this.selectedSchedule = undefined;
    this.selectedRange = [];
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.events!],
    };
    this.scrollToSchedule('schedule2');
  }



  goToMonth(month: string, year: string) {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(`${year}-${month.padStart(2, '0')}-01`);
  }

  navigateToDetails() {
    if (this.tourDetails && this.selectedSchedule && this.userId) {
      this.router.navigate(['/tour-booking', this.tourDetails.id, this.selectedSchedule.id]).then(() => {
        this.viewportScroller.scrollToPosition([0, 0]);
      });
    } else {
      this.router.navigate(['/login'])
    }
  }
  formatPolicy(text?: string): SafeHtml {                                // CHANGE
    if (!text) return '';                                                // CHANGE
    // 1) Chuẩn hóa xuống dòng gốc \n -> <br>
    let s = text.replace(/\r?\n/g, '<br>');                              // CHANGE
    // 2) Bất cứ khi nào có '-' ở đầu chuỗi hoặc sau khoảng trắng -> ngắt dòng
    //    Tránh phá các từ như e-mail vì sẽ không có khoảng trắng phía trước.
    s = s.replace(/(^|\s)-\s*/g, '<br>- ');                              // CHANGE
    return this.sanitizer.bypassSecurityTrustHtml(s);                    // CHANGE
  }                                             



  showOrHide() {
    this.isShow = !this.isShow;
  }
   // ==== Toggle từng ngày trong “Nội dung Tour” ====
  toggleDay(idx: number) {                    // CHANGE
    if (this.openDays.has(idx)) this.openDays.delete(idx);
    else this.openDays.add(idx);
  }                                           // CHANGE

  isDayOpen(idx: number): boolean {           // CHANGE
    return this.openDays.has(idx);
  }                                     
}