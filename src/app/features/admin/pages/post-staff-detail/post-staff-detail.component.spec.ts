import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostStaffDetailComponent } from './post-staff-detail.component';

describe('PostStaffDetailComponent', () => {
  let component: PostStaffDetailComponent;
  let fixture: ComponentFixture<PostStaffDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostStaffDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostStaffDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
