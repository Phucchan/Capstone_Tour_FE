import { Routes } from '@angular/router';
import { ListServiceProviderComponent } from './list-service-provider/list-service-provider.component';
import { AddServiceProviderComponent } from './list-service-provider/add-service-provider/add-service-provider.component';
import { ServiceTypeManagementComponent } from './service-type-management/service-type-management.component';

export const COORDINATOR_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'service-providers',
    pathMatch: 'full',
  },
  {
    path: 'service-providers',
    component: ListServiceProviderComponent,
  },
  {
    path: 'service-providers/create',
    component: AddServiceProviderComponent,
  },
  {
    path: 'service-providers/edit/:id',
    component: AddServiceProviderComponent,
  },
  {
    path: 'service-types', // URL: /coordinator/service-types
    component: ServiceTypeManagementComponent,
  },
];
