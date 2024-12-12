import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () => import('../login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'cars',
    loadChildren: () => import('./cars/cars.module').then((m) => m.CarsPageModule),
  },
  {
    path: 'car-add',
    loadChildren: () => import('./car-add/car-add.module').then((m) => m.CarAddPageModule),
  },
  {
    path: 'car-details/:id',
    loadChildren: () => import('../car-details/car-details.module').then((m) => m.CarDetailsPageModule),
  },
  {
    path: 'car-edit/:id',
    loadChildren: () => import('./car-edit/car-edit.module').then((m) => m.CarEditPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
