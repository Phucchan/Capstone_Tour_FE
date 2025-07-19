import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GeminiService } from './gemini.service';
import { ImageSearchService } from './plan-detail/imge.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { PlanService } from '../services/plan.service';
import e from 'express';

@Component({
  selector: 'app-plan',
  imports: [
    CommonModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    SpinnerComponent,
  ],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.css',
})
export class PlanComponent {
  suggesLocations: any;

  isLoading: boolean = false;

  generatePlanForm: FormGroup;

  locations: any;
  selectedLocation: any;

  isGenerating: boolean = false;

  constructor(
    private planService: PlanService,
    private fb: FormBuilder,
    private userStorageService: UserStorageService,
    private route: Router,
    private geminiService: GeminiService,
    private imageSearchService: ImageSearchService
  ) {
    this.generatePlanForm = this.fb.group({
      userId: ['', [Validators.required]],
      startDate: [''],
      endDate: [''],
      preferences: [[], [Validators.required]],
      planType: ['Du lịch Cá Nhân', [Validators.required]],
      travelingWithChildren: [false],
      days: this.fb.array([]), // ← thêm dòng này
      budget: this.fb.group({
        min: [''],
        max: [''],
      }),
    });

    this.addInterestForm = this.fb.group({
      interest: [''],
    });
  }

  get days(): FormArray {
    return this.generatePlanForm.get('days') as FormArray;
  }

  addInterest() {
    this.otherInterest = this.addInterestForm.value.interest;
  }

  addDay(dayNumber: number, location: any) {
    const dayGroup = this.fb.group({
      dayNumber: [dayNumber],
      locationId: [location.id],
      locationName: [location.name],
    });

    // Nếu ngày đó đã tồn tại → cập nhật
    const existing = this.days.at(dayNumber - 1);
    if (existing) {
      existing.patchValue(dayGroup.value);
    } else {
      this.days.push(dayGroup);
    }
  }

  maxEndDate: string = '';
  minEndDate: string = '';

  calculateEndDate() {
    const startDate = this.generatePlanForm.get('startDate')?.value;

    if (startDate) {
      const start = new Date(startDate);
      this.minEndDate = start.toISOString().split('T')[0];
      start.setDate(start.getDate() + 6); // Calculate End Date
      const endDateFormatted = start.toISOString().split('T')[0];
      this.maxEndDate = endDateFormatted;
    } // Set maxEndDate to 7 days after start date}
    else {
      this.minEndDate = new Date().toISOString().split('T')[0];
    }
  }

  addInterestForm: FormGroup;

  otherInterest: string = '';

  ngOnInit(): void {
    // Initialization logic can go here
    this.getLocations();
    this.setMinStartDate();

    this.generatePlanForm.patchValue({
      userId: this.userStorageService.getUserId(),
    });
  }

  getLocations() {
    this.planService.getLocationData().subscribe({
      next: (response) => {
        this.suggesLocations = response.data;
        this.locations = this.suggesLocations; // Initialize locations with all suggestions
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      },
    });
  }

  onPlanChange(plan: string): void {
    console.log('Selected plan:', plan);
  }

  response: any;

  onSubmit() {
    if (this.generatePlanForm.valid) {
      const formData = this.generatePlanForm.value;
      formData.isTravelingWithChildren = this.isTravelingWithChildren; // Set the traveling with children flag

      this.selectedInterests.push(this.otherInterest);

      formData.preferences = this.selectedInterests;

      console.log('Form submitted:', this.generatePlanForm.value);

      this.isGenerating = true;

      //Handle form submission logic here
      this.planService.generatePlan(formData).subscribe(
        (response) => {
          console.log(response);
          this.isGenerating = false;
        },
        (error) => {
          console.error('Error generating plan:', error);
        }
      );
    } else {
      console.log('Form is invalid:', this.generatePlanForm.value);
    }
  }

  async loadImagesForActivities(): Promise<void> {
    this.isGenerating = true;
    const imageFetchTasks: Promise<void>[] = [];

    this.response.plan.days.forEach((day: any) => {
      day.activities.forEach((activity: any) => {
        const task = this.imageSearchService
          .getImageUrl(activity.title)
          .toPromise()
          .then((res) => {
            activity.imageUrl =
              res.images_results?.[0]?.thumbnail ||
              'https://statics.vinpearl.com/pho-co-ha-noi-10_1687918089.jpg';
          })
          .catch((err) => {
            console.error(`Error fetching image for ${activity.title}:`, err);
            activity.imageUrl =
              'https://statics.vinpearl.com/pho-co-ha-noi-10_1687918089.jpg';
          });

        imageFetchTasks.push(task);
      });
    });

    await Promise.all(imageFetchTasks);
    this.isGenerating = false;
  }

  selectTrip(trip: any) {
    this.selectedTrip = trip;
    this.generatePlanForm.patchValue({ planType: trip.label });
    console.log('Selected trip:', trip);
  }

  interests: string[] = [
    'Danh lam thắng cảnh nổi tiếng',
    'Di tích lịch sử - văn hóa',
    'Làng cổ & phố cổ',
    'Ẩm thực đường phố Việt Nam',
    'Đặc sản vùng miền',
    'Nghệ thuật truyền thống (hát chèo, cải lương, múa rối nước)',
    'Lễ hội văn hóa đặc sắc',
    'Tour sinh thái & cộng đồng',
    'Trải nghiệm làm nông dân/ngư dân',
    'Khám phá vẻ đẹp thiên nhiên hoang sơ',
    'Chợ truyền thống & mua sắm đặc sản',
    'Thưởng thức cà phê Việt',
  ];

  selectedInterests: string[] = [];

  toggleInterest(interest: string): void {
    const index = this.selectedInterests.indexOf(interest);
    if (index === -1) {
      this.selectedInterests.push(interest);
    } else {
      this.selectedInterests.splice(index, 1);
    }

    this.generatePlanForm.patchValue({
      preferences: this.selectedInterests,
    });

    console.log('Selected interests: ', this.selectedInterests);
  }

  isSelected(interest: string): boolean {
    return (
      this.selectedInterests.includes(interest) || this.otherInterest != ''
    );
  }

  tripTypes = [
    { label: 'Du lịch Cá Nhân', icon: '👤' },
    { label: 'Tuần Trang Mật', icon: '💑' },
    { label: 'Du lịch bạn bè', icon: '👥' },
    { label: 'Du lịch gia đình', icon: '👨‍👩‍👧‍👦' },
  ];

  selectedTrip = this.tripTypes[0];
  isTravelingWithChildren = false;

  steps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
    { label: 'Step 4' },
  ];

  currentStep = 0;
  widthProgress = 25;

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  showError: boolean = false;
  errorMessage: string = 'Hãy chọn địa điểm!';

  showErrorMessage() {
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 3000); // Hide after 3 seconds
  }

  numberDays: number = 1;

  nextStep() {
    if (this.currentStep == 0) {
      if (
        !this.generatePlanForm.get('startDate') ||
        !this.generatePlanForm.get('endDate')
      ) {
        this.errorMessage = 'Hãy chọn ngày bắt đầu và ngày kết thúc!';
        this.showErrorMessage();
        return;
      }

      const startDate = this.generatePlanForm.get('startDate')?.value;
      const endDate = this.generatePlanForm.get('endDate')?.value;

      this.numberDays =
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 3600 * 24)
        ) + 1;

      this.selectedDestinations = Array(this.numberDays).fill(null);
      console.log('Number of days:', this.numberDays);
    } else if (this.currentStep == 1) {
      if (this.selectedDestinations.some((dest: any) => !dest)) {
        this.errorMessage = 'Hãy chọn địa điểm cho tất cả các ngày!';
        this.showErrorMessage();
        this.errorMessage = 'Hãy chọn địa điểm!';
        return;
      }
    } else if (this.currentStep == 2) {
      if (
        this.selectedBudget === 'custom' &&
        !this.budgetMin &&
        !this.budgetMax &&
        !this.customBudgetValue
      ) {
        this.errorMessage = 'Hãy nhập ngân sách tùy chỉnh!';
        this.showErrorMessage();
        return;
      }
    }

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  goToStep(index: number) {
    this.currentStep = index;
  }

  minStartDate: string = '';

  setMinStartDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Set to tomorrow
    this.minStartDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  selectedDestinations: any[] = [];

  currentDayIndex: number = 0;
  currentSelection: any = '';

  openModal(index: number) {
    this.currentDayIndex = index;
    this.currentSelection = this.selectedDestinations[index] || 'Chưa chọn';
    const modal = document.getElementById('destinationModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeModal() {
    const modal = document.getElementById('destinationModal');
    if (modal) modal.classList.add('hidden');
  }

  selectDestination(location: any) {
    const value = location;
    console.log('Bạn đã chọn:', value);
    console.log(
      `Selected destination for day ${this.currentDayIndex + 1}: ${value}`
    );
    this.currentSelection = value;
    console.log(this.selectedDestinations);
    this.selectedDestinations[this.currentDayIndex] = value;

    this.addDay(this.currentDayIndex + 1, value);

    this.closeModal();
  }

  filterDestination(event: any) {
    const searchTerm = this.removeVietnameseTones(
      event.target.value.toLowerCase()
    );
    console.log('Searching for:', searchTerm);

    this.locations = this.suggesLocations.filter((location: any) => {
      const name = this.removeVietnameseTones(location.name.toLowerCase());
      return name.includes(searchTerm);
    });
  }

  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD') // Tách ký tự có dấu thành ký tự thường + dấu
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu (tổ hợp Unicode)
      .replace(/đ/g, 'd') // Chuyển đ → d
      .replace(/Đ/g, 'd'); // Chuyển Đ → d
  }

  selectedBudget: string = 'low';
  customBudgetValue: any | null = null;

  selectBudget(option: string) {
    this.selectedBudget = option;

    // Reset custom value nếu không chọn custom
    if (option !== 'custom') {
      this.customBudgetValue = null;
      if (option == 'low') {
        this.generatePlanForm.patchValue({
          budget: {
            min: '5000000',
            max: '10000000',
          },
        });
      } else if (option == 'medium') {
        this.generatePlanForm.patchValue({
          budget: {
            min: '10000000',
            max: '15000000',
          },
        });
      } else if (option == 'high') {
        this.generatePlanForm.patchValue({
          budget: {
            min: '15000000',
            max: '20000000',
          },
        });
      } 
    }  else {
      this.generatePlanForm.patchValue({
        budget: {
          min: '',
          max: '',
        },
      });
    }

    // Patch vào form nếu có
    const budget = this.getBudgetValue();
    this.generatePlanForm.patchValue({ budget });
  }

  getBudgetValue(): any {
    if (this.selectedBudget === 'custom') {
      return this.customBudgetValue;
    }

    // Giá trị tượng trưng cho backend nếu cần
    return this.selectedBudget; // hoặc bạn có thể dùng: 'low', 'medium', 'high'
  }

  openBudgetModal() {
    const modal = document.getElementById('budgetModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeBudgetModal() {
    const modal = document.getElementById('budgetModal');
    if (modal) modal.classList.add('hidden');
  }

  budgetMin: string | null = null;
  budgetMax: string | null = null;

  saveBudgetRange() {
    if (this.budgetMin !== null && this.budgetMax !== null) {
      // Patch vào form nếu cần
      this.generatePlanForm.patchValue({
        budget: {
          min: this.budgetMin,
          max: this.budgetMax,
        },
      });

      this.customBudgetValue =
        this.formatWithCommas(this.budgetMin) +
        ' - ' +
        this.formatWithCommas(this.budgetMax) +
        ' VND'; // Cập nhật giá trị tùy chỉnh nếu cần

      this.generatePlanForm.patchValue({
        budget: {
          min: this.budgetMin.replace(/,/g, ''),
          max: this.budgetMax.replace(/,/g, ''),
        },
      });

      this.closeBudgetModal();
    } else {
      alert('Vui lòng nhập khoảng ngân sách hợp lệ');
    }
  }

  rawBudgetValue: string = '';
  formattedMinBudget: string = '';
  formattedMaxBudget: string = '';

  onBudgetInput(event: Event, isMax: boolean = false) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/,/g, ''); // xóa dấu phẩy cũ

    // Chỉ giữ lại số
    if (!/^\d*$/.test(value)) return;

    this.rawBudgetValue = value;

    // Thêm dấu phẩy lại
    value = this.formatWithCommas(value);
    if (!isMax) {
      this.formattedMinBudget = value;
      this.budgetMin = value.replace(/,/g, '');
    } else {
      this.formattedMaxBudget = value;
      this.budgetMax = value.replace(/,/g, '');
    }
  }

  formatWithCommas(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
