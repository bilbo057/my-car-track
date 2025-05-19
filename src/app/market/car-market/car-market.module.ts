// car-market.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CarMarketPageRoutingModule } from './car-market-routing.module';
import { TypeaheadModule } from '../../typeahead/typeahead.module';
import { CarMarketPage } from './car-market.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TypeaheadModule,
    CarMarketPageRoutingModule
  ],
  declarations: [CarMarketPage]
})
export class CarMarketPageModule {}