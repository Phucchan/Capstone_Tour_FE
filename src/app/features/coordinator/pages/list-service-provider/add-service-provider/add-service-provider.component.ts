import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, forkJoin, map } from 'rxjs';

// Models và Services cần thiết
import { LocationShort, ServiceTypeShort } from '../../../models/partner.model';
import { PartnerService } from '../../../services/partner.service';
import { ServiceTypeService } from '../../../services/service-type.service';
import { LocationService } from '../../../../business/services/location.service';

// Components dùng chung
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { LocationDTO } from '../../../../../core/models/location.model';

@Component({
  selector: 'app-add-service-provider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SpinnerComponent],
  templateUrl: './add-service-provider.component.html',
})
export class AddServiceProviderComponent implements OnInit {
  partnerForm: FormGroup;
  locationOptions: LocationShort[] = [];
  serviceTypeOptions: ServiceTypeShort[] = [];

  isEditMode = false;
  partnerId: number | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;
  pageTitle = 'Thêm mới Nhà cung cấp';

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    private serviceTypeService: ServiceTypeService,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.partnerForm = this.fb.group({
      name: ['', Validators.required],
      logoUrl: [''],
      contactPhone: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactName: [''],
      description: [''],
      websiteUrl: [''],
      locationId: [null, Validators.required],
      serviceTypeId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.partnerId = +id;
      this.pageTitle = 'Cập nhật Nhà cung cấp';
      this.loadPartnerForEdit();
    } else {
      this.isEditMode = false;
      this.pageTitle = 'Thêm mới Nhà cung cấp';
      this.loadDropdownData();
    }
  }

  loadPartnerForEdit(): void {
    if (!this.partnerId) return;
    this.isLoading = true;
    this.partnerService
      .getPartnerDetail(this.partnerId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.status === 200 && res.data) {
            const partnerData = res.data;
            this.partnerForm.patchValue({
              ...partnerData,
              locationId: partnerData.location?.id,
              serviceTypeId: partnerData.serviceType?.id,
            });
            this.locationOptions = partnerData.locationOptions;
            this.serviceTypeOptions = partnerData.serviceTypeOptions;
          } else {
            this.errorMessage = res.message;
          }
        },
        error: (err) => (this.errorMessage = err.message),
      });
  }

  loadDropdownData(): void {
    this.isLoading = true;

    // === SỬA LỖI TẠI ĐÂY ===
    // Gọi API lấy locations với size lớn để có tất cả
    const locations$ = this.locationService.getLocations(0, 1000).pipe(
      map((response) => {
        // Lỗi 2 & 3: Kiểm tra response và trích xuất mảng 'items'
        if (response && response.data && Array.isArray(response.data.items)) {
          // Chuyển đổi từ LocationDTO sang LocationShort nếu cần
          return response.data.items.map((loc: LocationDTO) => ({
            id: loc.id,
            name: loc.name,
          }));
        }
        // Trả về mảng rỗng nếu có lỗi hoặc không có dữ liệu
        return [];
      })
    );

    const serviceTypes$ = this.serviceTypeService.getServiceTypes().pipe(
      map((response) => {
        if (response.status === 200 && response.data) {
          return response.data.filter((st) => !st.deleted);
        }
        return [];
      })
    );

    forkJoin({
      locations: locations$,
      serviceTypes: serviceTypes$,
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ locations, serviceTypes }) => {
          this.locationOptions = locations;
          this.serviceTypeOptions = serviceTypes;
        },
        error: (err) => (this.errorMessage = err.message),
      });
  }

  onSubmit(): void {
    if (this.partnerForm.invalid) {
      this.partnerForm.markAllAsTouched();
      return;
    }
    if (this.isSaving) return;

    this.isSaving = true;
    const requestData = this.partnerForm.value;

    const action$ = this.isEditMode
      ? this.partnerService.updatePartner(this.partnerId!, requestData)
      : this.partnerService.addPartner(requestData);

    action$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.router.navigate(['/coordinator/service-providers']);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => (this.errorMessage = err.message),
    });
  }

  onCancel(): void {
    this.router.navigate(['/coordinator/service-providers']);
  }
}
