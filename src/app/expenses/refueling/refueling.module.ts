// refueling.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RefuelingPageRoutingModule } from './refueling-routing.module';
import { RefuelingPage } from './refueling.page';
import { DatetimePickerModule } from "../../datetime-picker/datetime-picker.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefuelingPageRoutingModule,
    DatetimePickerModule
],
  declarations: [RefuelingPage]
})
export class RefuelingPageModule {}