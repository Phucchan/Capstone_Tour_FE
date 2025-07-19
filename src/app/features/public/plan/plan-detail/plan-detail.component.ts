import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ImageSearchService } from './imge.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PlanService } from '../../services/plan.service';

@Component({
  selector: 'app-plan-detail',
  imports: [SpinnerComponent, RouterModule],
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.css',
})
export class PlanPreviewComponent {
  isLoading: boolean = false;

  constructor(
    private planService: PlanService,
    private fb: FormBuilder,
    private router: Router,
    private imageSearchService: ImageSearchService
  ) {}

  plan: any;

  planContent: any;

  restaurants: any[] = [];
  hotels: any[] = [];
  activities: any[] = [];

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

        console.log('All activities:', this.activities);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching plan', error);
      },
    });
  }

  onSave() {
    this.planService.updateStatusPlan(this.plan.id).subscribe({
      next: (response) => {
        console.log('Plan generated successfully', response);
        this.router.navigate(['/customer/plan-detail', this.plan.id]);
      },
      error: (error) => {
        console.error('Error generating plan', error);
      },
    });
  }
}
