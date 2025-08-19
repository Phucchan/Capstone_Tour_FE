import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinPhotoComponent } from './checkin-photo.component';

describe('CheckinPhotoComponent', () => {
  let component: CheckinPhotoComponent;
  let fixture: ComponentFixture<CheckinPhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckinPhotoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckinPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
