import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Observable } from 'rxjs';
import {
  PartnerServiceShortDTO,
  TourDayManagerDTO,
} from '../../../../core/models/tour.model';
import { PartnerServiceService } from '../../../../core/services/partner-service.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './service-form.component.html',
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private partnerService = inject(PartnerServiceService);

  @Input() isVisible = false;
  @Input() tourDays: TourDayManagerDTO[] = [];
  @Output() save = new EventEmitter<{ dayId: number; serviceId: number }>();
  @Output() close = new EventEmitter<void>();

  public serviceForm!: FormGroup;
  public allServices$!: Observable<PartnerServiceShortDTO[]>;

  ngOnInit(): void {
    this.serviceForm = this.fb.group({
      dayId: [null, Validators.required],
      serviceId: [null, Validators.required],
    });
 this.allServices$ = this.partnerService.getPartnerServices();
  }

  onSave(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.serviceForm.value);
  }

  onClose(): void {
    this.close.emit();
  }
}
