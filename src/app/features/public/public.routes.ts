import { Route } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ListTourComponent } from './list-tour/list-tour.component';
import { TourDetailComponent } from './tour-tourdetail/tour-detail.component';
import { TourBookingComponent } from '../customer/components/tour-booking/tour-booking.component';
import { CustomerLayoutComponent } from '../customer/components/Customer-layout/Customer-layout.component';
import { RequestBookingComponent } from '../customer/components/custom-order-tour/request-booking.component';
import { TourBookingConfirmComponent } from '../customer/components/tour-booking/tour-booking-confirm/tour-booking-confirm.component';
import { PlanComponent } from './plan/plan.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PlanPreviewComponent } from './plan/plan-detail/plan-detail.component';
import { CUSTOMER_ROUTES } from '../customer/customer.routes';
import { ListTourDiscountComponent } from './list-tour-discount/list-tour-discount.component';

export const PUBLIC_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full',
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'homepage',
        component: HomepageComponent,
      },
      {
        path: 'discount-tours',
        component: ListTourDiscountComponent,
      },
      {
        path: 'tours/location/:destId',
        component: ListTourComponent,
      },
      {
        path: 'tours/:id',
        component: TourDetailComponent,
      },
      {
        path: 'tour-booking/:id/:scheduleId',
        component: TourBookingComponent,
      },
      {
        path: 'tour-booking-detail/:code',
        component: TourBookingConfirmComponent,
      },
      {
        path: 'custom-order-tour',
        component: RequestBookingComponent,
      },
      {
        path: 'customer',
        component: CustomerLayoutComponent,
        canActivate: [AuthGuard],
        data: { expectedRoles: ['CUSTOMER'] },
        children: CUSTOMER_ROUTES // ✅ Sử dụng routes từ file riêng
      },
      {
        path: 'plan-generation',
        component: PlanComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'plan-preview/:id',
        component: PlanPreviewComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'blogs',
        // Tải các routes con từ file blog.routes.ts
        loadChildren: () => import('../blog/blog.routes').then(r => r.BLOG_ROUTES),
        data: { title: 'Tin tức' }
      },

    ],
  },

];
