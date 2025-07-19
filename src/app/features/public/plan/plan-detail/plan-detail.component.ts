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
  styleUrl: './plan-detail.component.css'
})
export class PlanDetailComponent {

  isLoading: boolean = false;


  constructor(
    private planService: PlanService,
    private fb: FormBuilder,
    private router: Router,
    private imageSearchService: ImageSearchService
  ) {


  }


  plan: any;

  planContent: any;

  restaurants: any[] = [];
  hotels: any[] = [];
  activities: any[] = []

  ngOnInit() {
    const planId = Number(this.router.url.split('/').pop());

    console.log(planId)

    if (planId) {
      this.getPlanById(planId);
    }
  }
  getPlanById(planId: number) {
    this.isLoading = true;
    this.planService.getPlanById(planId).subscribe({
      next: (response) => {
        this.plan = response.data;



        const cleanJsonString = this.plan.content
          .replace(/^```json\n/, '')  // Remove the opening triple backticks
          .replace(/\n```$/, '');
        let parsedData: any;



        try {
          parsedData = JSON.parse(cleanJsonString);
          this.planContent = parsedData;



          this.restaurants = Array.from(
            new Map(
              this.planContent.plan.days
                .flatMap((dayObj: any) => dayObj.restaurants || [])
                .map((rest: any) => [rest.name, rest]) // dùng name làm key
            ).values()
          );
          
          console.log('Restaurants (unique):', this.restaurants);

          this.hotels = Array.from(
            new Map(
              this.planContent.plan.days
                .flatMap((dayObj: any) => dayObj.hotels || [])
                .map((rest: any) => [rest.name, rest]) // dùng name làm key
            ).values()
          );
          
          console.log('Hotels (unique):', this.hotels);

          console.log('hotels (unique):', this.hotels);

          this.activities = this.planContent.plan.days
            .flatMap((dayObj: any) => dayObj.activities || []);

          console.log('All activities:', this.activities);;

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }

        this.isLoading = false;

      },
      error: (error) => {
        console.error('Error fetching plan', error);
      }
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
      }
    });

  }

}
