// mechanical-bills.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MechanicalBillsPageRoutingModule } from './mechanical-bills-routing.module';
import { MechanicalBillsPage } from './mechanical-bills.page';
import { DatetimePickerModule } from "../../datetime-picker/datetime-picker.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MechanicalBillsPageRoutingModule,
    DatetimePickerModule
],
  declarations: [MechanicalBillsPage]
})
export class MechanicalBillsPageModule {}