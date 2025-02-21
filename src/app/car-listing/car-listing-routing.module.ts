// car-listing-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CarListingPage } from './car-listing.page';

const routes: Routes = [
  {
    path: '',
    component: CarListingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarListingPageRoutingModule {}