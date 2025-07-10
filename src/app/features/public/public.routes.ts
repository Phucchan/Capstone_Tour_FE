import { Route } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ListTourComponent } from './list-tour/list-tour.component';
import { TourDetailComponent } from './tour-tourdetail/tour-detail.component';
import { TourBookingComponent } from '../customer/components/tour-booking/tour-booking.component';
import { ProfileComponent } from '../customer/components/profile/profile.component';
import { CustomTourBookingComponent } from '../customer/components/custom-tour-booking/custom-tour-booking.component';

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
        path: 'tours',
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
        path: 'custom-tour-booking',
        component: CustomTourBookingComponent,
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
