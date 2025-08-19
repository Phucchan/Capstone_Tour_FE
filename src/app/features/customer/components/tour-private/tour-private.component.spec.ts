import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourPrivateComponent } from './tour-private.component';

describe('TourPrivateComponent', () => {
  let component: TourPrivateComponent;
  let fixture: ComponentFixture<TourPrivateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourPrivateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourPrivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
