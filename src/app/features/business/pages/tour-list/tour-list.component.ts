import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  Observable,
  Subject,
  switchMap,
  debounceTime,
  startWith,
  combineLatest,
  BehaviorSubject,
} from 'rxjs';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

// Core Services & Models
import { TourService } from '../../../../core/services/tour.service';
import { TourListItem } from '../../../../core/models/tour.model';
import { Paging } from '../../../../core/models/paging.model';

// NG-ZORRO Imports
import { NzTableModule  } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    // --- NG-ZORRO ---
    NzTableModule,
    NzPaginationModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzPageHeaderModule,
    NzGridModule,
    NzCardModule,
    NzTagModule,
    NzIconModule,
    NzAvatarModule,
    NzDropDownModule,
    NzDividerModule,
  ],
  templateUrl: './tour-list.component.html',
})
export class TourListComponent implements OnInit {
  // --- Injections ---
  private tourService = inject(TourService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // --- State ---
  tours: TourListItem[] = [];
  isLoading = true;
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 1;

  filterForm!: FormGroup;
  private searchTrigger$ = new BehaviorSubject<void>(undefined);

  // --- Data for Filters ---
  tourTypes = ['FIXED', 'CUSTOM'];
  tourStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED'];

  labelTourTypes: Record<string, string> = {
    FIXED: 'Tour cố định',
    CUSTOM: 'Tour đặt riêng',
  };

labelTourStatuses: Record<string, string> = {
    DRAFT: 'Nháp',
    PUBLISHED: 'Đã xuất bản',
    CANCELLED: 'Đã hủy',
  };
  getTypeVi(type?: string): string {
    return (type && this.labelTourTypes[type]) || type || '';
  }


  getStatusVi(status?: string): string {
    return (status && this.labelTourStatuses[status]) || status || '';
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      keyword: [''],
      tourType: [null],
      tourStatus: [null],
    });

    this.filterForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.pageIndex = 1;
      this.searchTrigger$.next();
    });

    this.searchTrigger$
      .pipe(
        switchMap(() => {
          this.isLoading = true;
          const params = {
            page: this.pageIndex - 1,
            size: this.pageSize,
            ...this.filterForm.value,
          };
          return this.tourService.getTours(params);
        })
      )
      .subscribe((response) => {
        this.tours = response.items;
        this.totalRecords = response.total;
        this.isLoading = false;
      });
  }



  navigateToCreateTour(): void {
    this.router.navigate(['/business/tours/new']);
  }

  onNzPageIndexChange(p: number) {
    this.pageIndex = p;                     // nz-pagination là 1-based
    this.searchTrigger$.next();             // gọi lại API
  }

  onNzPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;                     // reset về trang 1
    this.searchTrigger$.next();             // gọi lại API
  }


  getStatusColor(status: string): string {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'blue';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  }
}
