// yearly-vehicle-check-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { YearlyVehicleCheckPage } from './yearly-vehicle-check.page';

const routes: Routes = [
  {
    path: '',
    component: YearlyVehicleCheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class YearlyVehicleCheckPageRoutingModule {}