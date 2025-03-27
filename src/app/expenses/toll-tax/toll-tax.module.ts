// toll-tax.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TollTaxPageRoutingModule } from './toll-tax-routing.module';
import { TollTaxPage } from './toll-tax.page';
import { DatetimePickerModule } from "../../datetime-picker/datetime-picker.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TollTaxPageRoutingModule,
    DatetimePickerModule
],
  declarations: [TollTaxPage]
})
export class TollTaxPageModule {}