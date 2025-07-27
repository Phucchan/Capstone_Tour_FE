import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaxFormComponent } from './pax-form.component';

describe('PaxFormComponent', () => {
  let component: PaxFormComponent;
  let fixture: ComponentFixture<PaxFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaxFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
