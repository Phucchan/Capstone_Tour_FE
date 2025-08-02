import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomOrderTourComponent } from './custom-order-tour.component';

describe('CustomOrderTourComponent', () => {
  let component: CustomOrderTourComponent;
  let fixture: ComponentFixture<CustomOrderTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomOrderTourComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomOrderTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
