import { Routes } from '@angular/router';
import { ListServiceProviderComponent } from './list-service-provider/list-service-provider.component';

export const COORDINATOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'service-providers',
    pathMatch: 'full',
  },
  {
    path: 'service-providers', // URL sẽ là /coordinator/service-providers
    component: ListServiceProviderComponent,
  },
];
