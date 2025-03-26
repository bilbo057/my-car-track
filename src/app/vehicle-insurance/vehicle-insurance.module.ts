// vehicle-insurance.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VehicleInsurancePageRoutingModule } from './vehicle-insurance-routing.module';
import { VehicleInsurancePage } from './vehicle-insurance.page';
import { DatetimePickerModule } from "../datetime-picker/datetime-picker.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehicleInsurancePageRoutingModule,
    DatetimePickerModule
],
  declarations: [VehicleInsurancePage]
})
export class VehicleInsurancePageModule {}