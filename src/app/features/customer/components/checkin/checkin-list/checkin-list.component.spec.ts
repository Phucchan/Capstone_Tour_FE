import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinListComponent } from './checkin-list.component';

describe('CheckinListComponent', () => {
  let component: CheckinListComponent;
  let fixture: ComponentFixture<CheckinListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckinListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckinListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
