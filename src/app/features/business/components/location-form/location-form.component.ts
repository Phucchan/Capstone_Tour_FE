import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { LocationDTO } from '../../../../core/models/location.model';
import { LocationService } from '../../services/location.service';

// NG-ZORRO Imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // --- NG-ZORRO ---
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzUploadModule,
    NzIconModule,
  ],
  templateUrl: './location-form.component.html',
})
export class LocationFormComponent implements OnInit, OnChanges {
  // --- Inputs & Outputs ---
  @Input() locationToEdit: LocationDTO | null = null;
  @Output() formSaved = new EventEmitter<boolean>();
  @Output() formCancelled = new EventEmitter<void>();

  // --- Injections ---
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);
  private message = inject(NzMessageService);

  // --- State ---
  locationForm: FormGroup;
  isSubmitting = false;
  imagePreview: string | ArrayBuffer | null = null;
  fileList: NzUploadFile[] = [];
  // FIX: Changed from private to public to be accessible in the template
  public selectedFile: File | null = null;

  constructor() {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.updateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locationToEdit']) {
      this.updateForm();
    }
  }

  updateForm(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileList = [];
    if (this.locationToEdit) {
      this.locationForm.patchValue({
        name: this.locationToEdit.name,
        description: this.locationToEdit.description,
      });
      if (this.locationToEdit.image) {
        this.imagePreview = this.locationToEdit.image;
        this.fileList = [
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: this.locationToEdit.image,
          },
        ];
      }
    } else {
      this.locationForm.reset();
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/webp';
    if (!isJpgOrPng) {
      this.message.error('Chỉ có thể tải lên file JPG/PNG/WEBP!');
      return false;
    }
    const isLt5M = file.size! / 1024 / 1024 < 5;
    if (!isLt5M) {
      this.message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    this.selectedFile = file as unknown as File;
    const reader = new FileReader();
    // FIX: Handle potential null value from e.target
    reader.onload = (e) => (this.imagePreview = e.target?.result ?? null);
    reader.readAsDataURL(this.selectedFile);

    return false;
  };

  onSubmit(): void {
    if (this.locationForm.invalid) {
      Object.values(this.locationForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    if (!this.locationToEdit && !this.selectedFile) {
      this.message.error('Vui lòng chọn ảnh đại diện.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('name', this.locationForm.controls['name'].value);
    formData.append(
      'description',
      this.locationForm.controls['description'].value
    );

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    const apiCall = this.locationToEdit
      ? this.locationService.updateLocation(this.locationToEdit.id, formData)
      : this.locationService.createLocation(formData);

    apiCall.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        this.message.success('Lưu địa điểm thành công!');
        this.formSaved.emit(true);
      },
      error: (err) => {
        console.error('API error:', err);
        this.message.error(err.error?.message || 'Không thể lưu địa điểm.');
        this.formSaved.emit(false);
      },
    });
  }

  cancel(): void {
    this.formCancelled.emit();
  }
}
