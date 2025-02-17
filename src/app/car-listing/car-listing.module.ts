import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarListingPageRoutingModule } from './car-listing-routing.module';

import { CarListingPage } from './car-listing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarListingPageRoutingModule
  ],
  declarations: [CarListingPage]
})
export class CarListingPageModule {}
