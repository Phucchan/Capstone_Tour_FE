import { AfterViewInit, Component } from '@angular/core';
import { PlanService } from '../../../services/plan.service';
import { UserStorageService } from '../../../../../core/services/user-storage/user-storage.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../../../shared/components/footer/footer.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { Modal } from 'flowbite';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-plan-detail',
  imports: [
    CommonModule,
    FooterComponent,
    SpinnerComponent,
    DragDropModule,
    ReactiveFormsModule,
  ],
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.css',
})
export class PlanDetailComponent implements AfterViewInit {
  constructor(
    private planService: PlanService,
    private userStorageService: UserStorageService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.addActivityForm = this.fb.group({
      title: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      content: ['', [Validators.required]],
      category: ['', [Validators.required]],
      imageUrl: ['', [Validators.required]],
    });

    this.editTimeForm = this.fb.group({
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
    });
  }

  editTime() {
    if (this.editTimeForm.invalid) {
      this.editTimeForm.markAllAsTouched();
      return;
    }

    const updatedTime = this.editTimeForm.value;

    // Tìm index của activity đang được chọn trong danh sách activities
    const index = this.selectedDay.activities.findIndex(
      (activity: any) => activity.id === this.selectedActivity.id
    );

    if (index !== -1) {
      // Cập nhật thời gian mới cho activity trong selectedDay
      this.selectedDay.activities[index].startTime = updatedTime.startTime;
      this.selectedDay.activities[index].endTime = updatedTime.endTime;

      // Đồng thời cập nhật selectedActivity (nếu đang dùng ở đâu khác)
      this.selectedActivity.startTime = updatedTime.startTime;
      this.selectedActivity.endTime = updatedTime.endTime;

      console.log('Cập nhật thời gian thành công');
    } else {
      console.error('Không tìm thấy activity để cập nhật');
    }
  }

  serviceModal: Modal | null = null;

  activityModal: Modal | null = null;

  editActivityModal: Modal | null = null;

  editTimeModal: Modal | null = null;

  selectedActivity: any;

  addActivityForm: FormGroup;

  editTimeForm: FormGroup;

  ngAfterViewInit(): void {
    this.serviceModal = new Modal(document.getElementById('service-modal'));
    this.activityModal = new Modal(document.getElementById('activity-modal'));
    this.editActivityModal = new Modal(
      document.getElementById('authentication-modal')
    );
    this.editTimeModal = new Modal(document.getElementById('crud-modal'));
  }

  openEditTimeModal(activity: any) {
    if (this.editTimeModal) {
      this.editTimeModal.show();
      this.selectedActivity = activity;
      this.editTimeForm.patchValue({
        startTime: activity.startTime,
        endTime: activity.endTime,
      });

      console.log(activity);
    }
  }

  closeEditTimeModal() {
    if (this.editTimeModal) {
      this.editTimeModal.hide();
    }
  }

  openEditActivityModal() {
    if (this.editActivityModal) {
      this.editActivityModal.show();
    }
  }

  closeEditActivityModal() {
    if (this.editActivityModal) {
      this.editActivityModal.hide();
    }
  }

  saveActivity() {
    if (this.addActivityForm.valid) {
      this.selectedDay.activities.push(this.addActivityForm.value);
    } else {
      this.addActivityForm.markAllAsTouched();
    }
  }

  openActivityModal() {
    if (this.activityModal) {
      this.activityModal.show();
    }
  }

  closeActivityModal() {
    if (this.activityModal) {
      this.activityModal.hide();
    }
  }

  dropActivity(event: CdkDragDrop<any[]>) {
    if (event.previousIndex !== event.currentIndex && this.isEdited) {
      moveItemInArray(
        this.selectedDay.activities,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  selectedCategoryName: string = 'Hotel';

  openServiceModal(categoryName: string) {
    if (this.serviceModal) {
      this.serviceModal.show();
    }
    this.selectedCategoryName = categoryName;
    console.log(this.selectedCategoryName);

    this.fetchProviderByCategoryAndLocationId(
      this.plan.content.locationId,
      this.selectedCategoryName
    );
  }

  closeServiceModal() {
    if (this.serviceModal) {
      this.serviceModal.hide();
    }
  }

  plan: any;

  startDate: any;
  endDate: any;

  isLoading: boolean = true;

  selectedDay: any = null;

  isEdited: boolean = false;

  ids: any[] = [];

  onEditPlan() {
    this.isEdited = !this.isEdited;
  }

  deleteRestaurant(restaurant: any) {
    console.log(restaurant);

    console.log(this.selectedDay.restaurants);

    this.selectedDay.restaurants = this.selectedDay.restaurants.filter(
      (r: any) => r.id !== restaurant.id
    );

    this.triggerSuccess();

    this.updateSelectedDay(this.selectedDay);
  }

  deleteActivity(activity: any) {
    console.log(activity);
    console.log(this.selectedDay.activities);
    this.selectedDay.activities = this.selectedDay.activities.filter(
      (a: any) => a.id !== activity.id
    );
    this.triggerSuccess();

    this.updateSelectedDay(this.selectedDay);
  }

  deleteHotel(hotel: any) {
    console.log(hotel);

    console.log(this.selectedDay.hotels);

    this.selectedDay.hotels = this.selectedDay.hotels.filter(
      (r: any) => r.id !== hotel.id
    );

    this.triggerSuccess();

    this.updateSelectedDay(this.selectedDay);
  }

  onCancel() {
    this.getPlanDetailById(this.plan.id);
    this.isEdited = false;
  }

  onSave() {
    console.log(this.plan);
    this.isEdited = false;

    const content = '{"plan":' + JSON.stringify(this.plan.content) + '}';

    this.planService.updatePlan(this.plan.id, content).subscribe(
      (response) => {
        console.log('Plan updated successfully:', response);
        this.triggerSuccess();
      },
      (error) => {
        console.error('Error updating plan:', error);
        this.triggerError();
      }
    );
  }

  showSuccess: boolean = false;
  showError: boolean = false;

  successMessage: string = 'Chỉnh sửa thành công';
  errorMessage: string = 'Chỉnh sửa  thất bại';

  triggerSuccess() {
    this.showSuccess = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }

  triggerError() {
    this.showError = true;

    // Hide warning after 3 seconds
    setTimeout(() => {
      this.showError = false;
    }, 4000);
  }

  activities: any[] = [];
  filteredActivities: any[] = [];

  ngOnInit() {
    const planId = Number(this.router.url.split('/').pop());
    console.log(planId);
    this.getPlanDetailById(planId);
  }

  onSelectDay(day: any) {
    this.selectedDay = day;

    console.log(this.selectedDay);
  }

  filterActivities(event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredActivities = this.activities.filter((activity) =>
      activity.title.toLowerCase().includes(input)
    );
  }

  getPlanDetailById(planId: number) {
    this.isLoading = true;
    this.planService.getPlanById(planId).subscribe(
      (response) => {
        this.plan = response.data;

        this.plan.content = JSON.parse(
          this.plan.content.replace(/^```json\n/, '').replace(/\n```$/, '')
        ).plan;
        this.startDate = this.plan.content.days[0].date;
        this.endDate =
          this.plan.content.days[this.plan.content.days.length - 1].date;
        this.selectedDay = this.plan.content.days[0];

        console.log(this.selectedDay);

        const ids: number[] = Array.from(
          new Set(
            this.plan.content.days.flatMap((day: any) => [
              ...day.hotels.map((hotel: any) => hotel.id),
              ...day.restaurants.map((restaurant: any) => restaurant.id),
            ])
          )
        );

        this.ids = ids;
        console.log(this.plan);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching plan details:', error);
        this.isLoading = false;
      }
    );
  }

  updateSelectedDay(updatedDay: any): void {
    const index = this.plan.content.days.findIndex(
      (d: any) => d.date === updatedDay.date
    );
    if (index !== -1) {
      this.plan.content.days[index] = { ...updatedDay };
      this.selectedDay = this.plan.content.days[index];
    }
  }

  providers: any[] = [];
  filteredProviders: any[] = [];

  filterProvider(event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();

    console.log(input);

    this.filteredProviders = this.providers.filter((provider) =>
      provider.name.toLowerCase().includes(input)
    );
  }

  fetchProviderByCategoryAndLocationId(
    locationId: number,
    categoryName: string
  ) {
    this.providers = [];
    this.planService
      .fetchProviderByCategoryAndLocationId(locationId, categoryName, this.ids)
      .subscribe(
        (response) => {
          console.log('Providers fetched successfully:', response);
          this.providers = response.data;
          this.filteredProviders = response.data;
        },
        (error) => {
          console.error('Error fetching providers:', error);
        }
      );
  }

  response: any;


  onSelectActivity(activity: any) {
    console.log(activity);
    this.selectedDay.activities.push(activity);
    this.triggerSuccess();
    this.updateSelectedDay(this.selectedDay);
    this.closeActivityModal();
  }

  onSelectProvider(provider: any) {
    console.log(provider);
    if (this.selectedCategoryName === 'Hotel') {
      this.selectedDay.hotels.push(provider);
      this.triggerSuccess();
    } else if (this.selectedCategoryName === 'Restaurant') {
      this.selectedDay.restaurants.push(provider);
      this.triggerSuccess();
    } else if (this.selectedCategoryName === 'Activity') {
      this.selectedDay.activities.push(provider);
      this.triggerSuccess();
    }
    this.updateSelectedDay(this.selectedDay);
    this.closeServiceModal();
  }

  onSendRequest() {
    this.planService.senRequestPlan(this.plan.id).subscribe(
      (response) => {
        console.log('Plan updated successfully:', response);
        this.successMessage = 'Gửi yêu cầu thành công';
        this.triggerSuccess();
        this.successMessage = 'Thay đổi thành công';
        this.getPlanDetailById(this.plan.id);
      },
      (error) => {
        console.error('Error updating plan:', error);
        this.triggerError();
      }
    );
  }
}
