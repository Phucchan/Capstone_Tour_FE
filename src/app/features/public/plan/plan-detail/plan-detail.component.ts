import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ImageSearchService } from './imge.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PlanService } from '../../services/plan.service';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CommonModule } from '@angular/common';
import { TimePipe } from '../../../../shared/pipes/time.pipe';
import { CurrencyPipe } from '../../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-plan-detail',
  imports: [
    SpinnerComponent,
    RouterModule,
    FormatDatePipe,
    CommonModule,
    TimePipe,
    CurrencyPipe,
  ],
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.css',
})
export class PlanPreviewComponent {
  isLoading: boolean = false;

  constructor(
    private planService: PlanService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  plan: any;

  planContent: any;

  restaurants: any[] = [];
  hotels: any[] = [];
  activities: any[] = [];

  locations: any[] = [];

  selectedDay: any = null;

  step = 0;

  nextStep() {
    this.step++;
    console.log('Current step:', this.step);
    this.selectedDay = this.plan.days[this.step - 1];
    this.fullText = this.selectedDay.longDescription;
    this.displayedText = '';
    this.index = 0;
    this.typeNextCharacter();
  }

  previousStep() {
    if (this.step > 0) {
      this.step--;
      console.log('Current step:', this.step);
      this.selectedDay = this.plan.days[this.step - 1];
      if(this.step == 0) {
        this.fullText = '🐤 Tớ là hướng dẫn viên đặc biệt của bạn hôm nay. Tớ sẽ đồng hành cùng bạn trong suốt chuyến đi này, kể cho bạn nghe từng câu chuyện thú vị ở mỗi điểm đến. Cùng tớ khám phá các địa điểm hấp dẫn, thưởng thức món ăn ngon, và tạo nên những kỷ niệm tuyệt vời nhé! 🧳✨';
      }
      else this.fullText = this.selectedDay.longDescription;
      this.displayedText = this.fullText;
      this.index = 0;
    }
  }


  ngOnInit() {
    const planId = this.router.url.split('/').pop();

    console.log(planId);

    if (planId) {
      this.getPlanById(planId);
    }
  }
  getPlanById(planId: any) {
    this.isLoading = true;
    this.planService.getPlanById(planId).subscribe({
      next: (response) => {
        this.plan = response.data;

        console.log('Plan data:', this.plan);

        this.restaurants = Array.from(
          new Map(
            this.plan.days
              .flatMap((dayObj: any) => dayObj.restaurants || [])
              .map((rest: any) => [rest.name, rest]) // dùng name làm key
          ).values()
        );

        console.log('Restaurants (unique):', this.restaurants);

        this.hotels = Array.from(
          new Map(
            this.plan.days
              .flatMap((dayObj: any) => dayObj.hotels || [])
              .map((rest: any) => [rest.name, rest]) // dùng name làm key
          ).values()
        );

        console.log('Hotels (unique):', this.hotels);

        console.log('hotels (unique):', this.hotels);

        this.activities = this.plan.days.flatMap(
          (dayObj: any) => dayObj.activities || []
        );

        this.locations = this.plan.days.map(
          (dayObj: any) => dayObj.locationName
        );

        console.log('All activities:', this.activities);
        console.log('All locations:', this.locations);

        this.selectedDay = this.plan.days[0];

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching plan', error);
      },
    });
  }

  fullText = '🐤 Tớ là hướng dẫn viên đặc biệt của bạn hôm nay. Tớ sẽ đồng hành cùng bạn trong suốt chuyến đi này, kể cho bạn nghe từng câu chuyện thú vị ở mỗi điểm đến. Cùng tớ khám phá các địa điểm hấp dẫn, thưởng thức món ăn ngon, và tạo nên những kỷ niệm tuyệt vời nhé! 🧳✨';
  displayedText = '';
  index = 0;

  ngAfterViewInit() {
    this.typeNextCharacter();
  }

  typeNextCharacter() {
    if (this.index < this.fullText.length) {
      this.displayedText += this.fullText.charAt(this.index);
      this.index++;
      setTimeout(() => this.typeNextCharacter(), 15); // tốc độ gõ
    }
  }
}
