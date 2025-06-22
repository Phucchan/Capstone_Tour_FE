import { Route } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { HomepageComponent } from './homepage/homepage.component';

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
    ],
  },
];
