import { AfterViewInit, Component, signal } from '@angular/core';
import { PlanService } from '../../services/plan.service';
import { UserStorageService } from '../../../../core/services/user-storage/user-storage.service';
import { RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TableFooterComponent } from '../../../../shared/components/table/table-footer/table-footer.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { Modal } from 'flowbite';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';


@Component({
  selector: 'app-list-plan',
  imports: [RouterModule, CommonModule, TableFooterComponent, SpinnerComponent, CurrencyVndPipe],
  templateUrl: './list-plan.component.html',
  styleUrl: './list-plan.component.css'
})
export class ListPlanComponent implements AfterViewInit{

  constructor(
    private planService: PlanService,
    private userStorageService: UserStorageService,
  ) {}


  confirmModal: Modal | null = null;

  ngAfterViewInit(): void {
    this.confirmModal = new Modal(document.getElementById('popup-modal'));
  }


  selectedPlanId: any;

  openConfirmModal(planId: any) {
    if (this.confirmModal) {
      this.confirmModal.show();
    }
    this.selectedPlanId = planId;
  }

  closeConfirmModal() {
    if (this.confirmModal) {
      this.confirmModal.hide();
    }
  }

  deletePlan() {
    this.isLoading = true;
    this.planService.deletePlan(this.selectedPlanId).subscribe({
      next: (response) => {
        console.log(response);
        this.getListPlanByUserId();
        this.closeConfirmModal();
        this.isLoading = false;
        this.triggerSuccess();
        
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
        this.triggerError();
      }
    });
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

  userId: any;

  totalItems = 0;
  page = 0;
  size = 5;
  totalPages = signal(0)
  isLoading: boolean = true;

  plans: any;

  ngOnInit() {
    this.userId = this.userStorageService.getUserId();

    if(this.userId) {
      this.getListPlanByUserId();

    }
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.getListPlanByUserId();
    }
  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
  }


  getListPlanByUserId() {
    this.isLoading = true;
    this.planService.getPlanByPage(
      this.page,
      this.size,
      'id',
      'desc',
      this.userId
    ).subscribe({
      next: (response) => {
        console.log(response.data)

        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;

        this.plans = response.data.items;

        console.log(this.plans)
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }

}
