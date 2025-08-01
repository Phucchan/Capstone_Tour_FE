import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTourDiscountComponent } from './list-tour-discount.component';

describe('ListTourDiscountComponent', () => {
  let component: ListTourDiscountComponent;
  let fixture: ComponentFixture<ListTourDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTourDiscountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTourDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
