// car-offer-details.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CarOfferDetailsPageRoutingModule } from './car-offer-details-routing.module';
import { CarOfferDetailsPage } from './car-offer-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarOfferDetailsPageRoutingModule
  ],
  declarations: [CarOfferDetailsPage]
})
export class CarOfferDetailsPageModule {}