import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ListCustomerComponent } from './list-customer.component';

describe('ListCustomerComponent', () => {
  let component: ListCustomerComponent;
  let fixture: ComponentFixture<ListCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Vì component là standalone, ta import nó trực tiếp
      // Thêm RouterTestingModule để giả lập Router cho việc test
      imports: [ListCustomerComponent, RouterTestingModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Kích hoạt ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a list of customers after ngOnInit', () => {
    // Kiểm tra xem mảng customers có dữ liệu sau khi component được khởi tạo
    expect(component.customers.length).toBeGreaterThan(0);
  });
});
