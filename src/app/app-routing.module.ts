// app-routing.module.ts
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
    loadChildren: () => import('./login/login.module').then((m) => m.LoginPageModule),
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
    loadChildren: () => import('./car-details/car-details.module').then((m) => m.CarDetailsPageModule),
  },
  {
    path: 'car-edit/:id',
    loadChildren: () => import('./car-edit/car-edit.module').then((m) => m.CarEditPageModule),
  },  {
    path: 'refueling',
    loadChildren: () => import('./refueling/refueling.module').then( m => m.RefuelingPageModule)
  },
  {
    path: 'toll-tax',
    loadChildren: () => import('./toll-tax/toll-tax.module').then( m => m.TollTaxPageModule)
  },
  {
    path: 'annual-tax',
    loadChildren: () => import('./annual-tax/annual-tax.module').then( m => m.AnnualTaxPageModule)
  },
  {
    path: 'maintaining',
    loadChildren: () => import('./maintaining/maintaining.module').then( m => m.MaintainingPageModule)
  },
  {
    path: 'vehicle-insurance',
    loadChildren: () => import('./vehicle-insurance/vehicle-insurance.module').then( m => m.VehicleInsurancePageModule)
  },
  {
    path: 'mechanical-bills',
    loadChildren: () => import('./mechanical-bills/mechanical-bills.module').then( m => m.MechanicalBillsPageModule)
  },
  {
    path: 'yearly-vehicle-check',
    loadChildren: () => import('./yearly-vehicle-check/yearly-vehicle-check.module').then( m => m.YearlyVehicleCheckPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
