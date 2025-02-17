import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarOfferDetailsPage } from './car-offer-details.page';

const routes: Routes = [
  {
    path: '',
    component: CarOfferDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarOfferDetailsPageRoutingModule {}
