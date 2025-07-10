import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTourBookingComponent } from './custom-tour-booking.component';

describe('CustomTourBookingComponent', () => {
  let component: CustomTourBookingComponent;
  let fixture: ComponentFixture<CustomTourBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomTourBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTourBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
