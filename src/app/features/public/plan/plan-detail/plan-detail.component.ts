import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PlanService } from '../../services/plan.service';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { CommonModule } from '@angular/common';
import { TimePipe } from '../../../../shared/pipes/time.pipe';
import { CurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { tr } from 'date-fns/locale';
import { NgxChartsModule } from '@swimlane/ngx-charts';

enum ScaleType {
  Time = 'time',
  Linear = 'linear',
  Ordinal = 'ordinal',
  Quantile = 'quantile',
}

interface Color {
  name: string;
  selectable: boolean;
  group: ScaleType;
  domain: string[];
}

interface ChartDataPoint {
  name: string;
  value: number;
}

@Component({
  selector: 'app-plan-detail',
  imports: [
    SpinnerComponent,
    RouterModule,
    FormatDatePipe,
    CommonModule,
    TimePipe,
    CurrencyPipe,
    NgxChartsModule,
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

  plan: any = '';

  planContent: any;

  restaurants: any[] = [];
  hotels: any[] = [];
  activities: any[] = [];

  locations: any[] = [];

  selectedDay: any = null;

  chartColorScheme: Color = {
    name: 'travel-futuristic',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#374F43',
      '#25344F',
      '#617891',
      '#D5B893',
      '#6F4D38',
      '#632024',
      '#44576D',
      '#768A96',
      '#AAC7D8',
    ],
  };

  xAxisLabelUsers = 'Ngày';
  yAxisLabelUsers = 'Chi phí';
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  doughnut = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  newUserChartView: [number, number] = [500, 300];

  dayTotals: Array<{ name: string; value: number }> = [];

  tourTypeChartView: [number, number] = [500, 300];

  tourTypeChartData: Array<{ name: string; value: number }> = [];
  private totalValue = 0;

  formatPercentage(value: any): string {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`; // Format percentage with 1 decimal place
    }
    return value?.toString() ?? '';
  }

  onChartSelect(event: any): void {
    console.log('Chart item selected:', event);
  }

  step = 0;

  nextStep() {
    this.step++;
    console.log('Current step:', this.step);
    if (this.step <= this.plan?.days.length) {
      this.selectedDay = this.plan.days[this.step - 1];
      this.fullText = this.selectedDay.longDescription;
    }

    if (this.step == this.plan?.days.length + 1) {
      this.fullText =
        '🐤 Hành trình được thiết kế với sự kết hợp giữa máy bay cho các chặng dài và ô tô/xe thuê cho quãng đường ngắn, đảm bảo vừa tiết kiệm thời gian vừa linh hoạt khám phá. Chi phí di chuyển bao gồm vé máy bay khứ hồi và thuê xe trọn gói';
    }

    if (this.step == this.plan?.days.length + 2) {
      this.fullText =
        '🐤 Cuối cùng, mình xin gửi đến bạn phần phân tích chi phí cho toàn bộ chuyến đi. Chúc bạn sẽ có một chuyển đi vui vẻ và trọn vẹn. ';
    }

    this.displayedText = '';
    this.index = 0;
    this.typeNextCharacter();
  }

  previousStep() {
    if (this.step > 0) {
      this.step--;
      console.log('Current step:', this.step);
      this.selectedDay = this.plan.days[this.step - 1];
      if (this.step == 0) {
        this.fullText =
          '🐤 Tớ là hướng dẫn viên đặc biệt của bạn hôm nay. Tớ sẽ đồng hành cùng bạn trong suốt chuyến đi này, kể cho bạn nghe từng câu chuyện thú vị ở mỗi điểm đến. Cùng tớ khám phá các địa điểm hấp dẫn, thưởng thức món ăn ngon, và tạo nên những kỷ niệm tuyệt vời nhé! 🧳✨';
      } else this.fullText = this.selectedDay.longDescription;
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

  savePlan() {
    this.isLoading = true;
    this.planService.savePlan(this.plan?.id).subscribe({
      next: (response) => {
        console.log('Plan saved successfully:', response);
        this.isLoading = false;
        //this.router.navigate(['/customer/plan-detail', this.plan.id]);
      },
      error: (error) => {
        console.error('Error saving plan:', error);
        this.isLoading = false;
      }
    });
  }

  private computeTotals(plan: any) {
    const acc = { restaurants: 0, hotels: 0, activities: 0 };
    if (!plan?.days?.length) return acc;

    for (const d of plan.days) {
      acc.restaurants += (d.restaurants ?? []).reduce(
        (s: any, r: any) => s + (r.estimatedCost ?? 0),
        0
      );
      acc.hotels += (d.hotels ?? []).reduce(
        (s: any, h: any) => s + (h.estimatedCost ?? 0),
        0
      );
      acc.activities += (d.activities ?? []).reduce(
        (s: any, a: any) => s + (a.estimatedCost ?? 0),
        0
      );
    }

    return acc;
  }

  // Hiển thị nhãn quanh lát cắt (chỉ tên)
  formatLabel = (label: string): string => label;
  totals: any;

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

        this.totals = this.computeTotals(this.plan);

        this.tourTypeChartData = [
          { name: 'Nhà hàng', value: this.totals.restaurants },
          { name: 'Khách sạn', value: this.totals.hotels },
          { name: 'Hoạt động', value: this.totals.activities },
        ];

        this.dayTotals = this.plan.days.map((d: any, idx: any) => {
          const total =
            (d.restaurants ?? []).reduce(
              (s: any, r: any) => s + (r.estimatedCost ?? 0),
              0
            ) +
            (d.hotels ?? []).reduce(
              (s: any, h: any) => s + (h.estimatedCost ?? 0),
              0
            ) +
            (d.activities ?? []).reduce(
              (s: any, a: any) => s + (a.estimatedCost ?? 0),
              0
            );

          return {
            name: `Ngày ${idx + 1}`,
            value: total,
          };
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching plan', error);
      },
    });
  }

  fullText =
    '🐤 Tớ là hướng dẫn viên đặc biệt của bạn hôm nay. Tớ sẽ đồng hành cùng bạn trong suốt chuyến đi này, kể cho bạn nghe từng câu chuyện thú vị ở mỗi điểm đến. Cùng tớ khám phá các địa điểm hấp dẫn, thưởng thức món ăn ngon, và tạo nên những kỷ niệm tuyệt vời nhé! 🧳✨';
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
