import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanGenerateComponent } from './plan-generate.component';

describe('PlanGenerateComponent', () => {
  let component: PlanGenerateComponent;
  let fixture: ComponentFixture<PlanGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanGenerateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
