import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSidebarMenuComponent } from './admin-sidebar-menu.component';

describe('AdminSidebarMenuComponent', () => {
  let component: AdminSidebarMenuComponent;
  let fixture: ComponentFixture<AdminSidebarMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSidebarMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSidebarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
