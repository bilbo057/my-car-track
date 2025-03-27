// annual-tax.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnnualTaxPageRoutingModule } from './annual-tax-routing.module';

import { AnnualTaxPage } from './annual-tax.page';
import { DatetimePickerModule } from "../../datetime-picker/datetime-picker.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnnualTaxPageRoutingModule,
    DatetimePickerModule
],
  declarations: [AnnualTaxPage]
})
export class AnnualTaxPageModule {}
