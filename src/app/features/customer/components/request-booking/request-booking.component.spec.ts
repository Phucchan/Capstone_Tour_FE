import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestBookingComponent } from './request-booking.component';

describe('RequestBookingComponent', () => {
  let component: RequestBookingComponent;
  let fixture: ComponentFixture<RequestBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
