import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarMarketPage } from './car-market.page';

const routes: Routes = [
  {
    path: '',
    component: CarMarketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarMarketPageRoutingModule {}
