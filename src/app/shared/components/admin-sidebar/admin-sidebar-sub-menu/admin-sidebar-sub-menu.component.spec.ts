import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSidebarSubMenuComponent } from './admin-sidebar-sub-menu.component';

describe('AdminSidebarSubMenuComponent', () => {
  let component: AdminSidebarSubMenuComponent;
  let fixture: ComponentFixture<AdminSidebarSubMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSidebarSubMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSidebarSubMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
