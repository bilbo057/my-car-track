// yearly-vehicle-check.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { YearlyVehicleCheckPageRoutingModule } from './yearly-vehicle-check-routing.module';
import { YearlyVehicleCheckPage } from './yearly-vehicle-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    YearlyVehicleCheckPageRoutingModule
  ],
  declarations: [YearlyVehicleCheckPage]
})
export class YearlyVehicleCheckPageModule {}