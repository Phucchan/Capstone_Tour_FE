import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourBookingConfirmComponent } from './tour-booking-confirm.component';

describe('TourBookingConfirmComponent', () => {
  let component: TourBookingConfirmComponent;
  let fixture: ComponentFixture<TourBookingConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourBookingConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourBookingConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
