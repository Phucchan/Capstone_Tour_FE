import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestBookingListComponent } from './request-booking-list.component';

describe('RequestBookingListComponent', () => {
  let component: RequestBookingListComponent;
  let fixture: ComponentFixture<RequestBookingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestBookingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestBookingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
