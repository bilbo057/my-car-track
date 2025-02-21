// vehicle-insurance-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VehicleInsurancePage } from './vehicle-insurance.page';

const routes: Routes = [
  {
    path: '',
    component: VehicleInsurancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleInsurancePageRoutingModule {}