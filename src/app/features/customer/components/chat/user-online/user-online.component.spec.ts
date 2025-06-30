import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOnlineComponent } from './user-online.component';

describe('UserOnlineComponent', () => {
  let component: UserOnlineComponent;
  let fixture: ComponentFixture<UserOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOnlineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
