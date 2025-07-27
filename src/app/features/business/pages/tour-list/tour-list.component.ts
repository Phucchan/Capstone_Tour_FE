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
} from 'rxjs';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { TourService } from '../../../../core/services/tour.service';
import { TourListItem, PagingDTO } from '../../../../core/models/tour.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent,
    RouterLink,
  ],
  templateUrl: './tour-list.component.html',
  styleUrls: ['./tour-list.component.css'],
})
export class TourListComponent implements OnInit {
  private tourService = inject(TourService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  public toursResponse$!: Observable<PagingDTO<TourListItem>>;
  public filterForm!: FormGroup;
  private page$ = new Subject<number>();
  private readonly DEFAULT_PAGE_SIZE = 10;

  public tourTypes = ['FIXED', 'CUSTOM']; // Lấy từ Enum backend
  public tourStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED']; // Lấy từ Enum backend

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      keyword: [''],
      tourType: [null],
      tourStatus: [null],
    });

    const page$ = this.page$.pipe(startWith(0));

    const filters$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(300)
    );

    this.toursResponse$ = combineLatest([filters$, page$]).pipe(
      switchMap(([filters, page]) => {
        const params = {
          page,
          size: this.DEFAULT_PAGE_SIZE,
          ...filters,
        };
        return this.tourService.getTours(params);
      })
    );
  }

  onPageChange(page: number): void {
    this.page$.next(page);
  }

  navigateToCreateTour(): void {
    this.router.navigate(['/business/tours/new']);
  }


}
