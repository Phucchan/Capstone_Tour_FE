import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCostingComponent } from './tour-costing.component';

describe('TourCostingComponent', () => {
  let component: TourCostingComponent;
  let fixture: ComponentFixture<TourCostingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourCostingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourCostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
