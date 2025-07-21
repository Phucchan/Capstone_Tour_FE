import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDayFormComponent } from './tour-day-form.component';

describe('TourDayFormComponent', () => {
  let component: TourDayFormComponent;
  let fixture: ComponentFixture<TourDayFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourDayFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourDayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
