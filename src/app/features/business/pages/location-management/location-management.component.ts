// src/app/features/business/pages/location-management/location-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { LocationDTO } from '../../../../core/models/location.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LocationFormComponent } from '../../components/location-form/location-form.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-location-management',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    PaginationComponent,
    LocationFormComponent,
  ],
  templateUrl: './location-management.component.html',
})
export class LocationManagementComponent implements OnInit {
  locations: LocationDTO[] = [];
  isLoading = true;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  isModalVisible = false;
  selectedLocation: LocationDTO | null = null;

  private searchSubject = new Subject<string>();
  private currentKeyword = '';

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadLocations(this.currentPage);

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((keyword) => {
        this.currentKeyword = keyword;
        this.loadLocations(1, keyword);
      });
  }

  loadLocations(page: number, keyword?: string): void {
    this.isLoading = true;
    this.currentPage = page;
    this.locationService
      .getLocations(page - 1, this.pageSize, keyword)
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.locations = response.data.items;
            this.totalItems = response.data.total;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('An error occurred:', err);
          this.isLoading = false;
        },
      });
  }

  onSearch(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value;
    this.searchSubject.next(keyword);
  }

  onPageChange(page: number): void {
    this.loadLocations(page, this.currentKeyword);
  }

  openAddModal(): void {
    this.selectedLocation = null;
    this.isModalVisible = true;
  }

  openEditModal(location: LocationDTO): void {
    this.selectedLocation = { ...location };
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedLocation = null;
  }

  onFormSaved(success: boolean): void {
    if (success) {
      this.closeModal();
      // Tải lại trang hiện tại để thấy thay đổi
      this.loadLocations(this.currentPage, this.currentKeyword);
    }
  }
}
