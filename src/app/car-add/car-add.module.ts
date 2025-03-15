// car-add.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CarAddPageRoutingModule } from './car-add-routing.module';
import { CarAddPage } from './car-add.page';
import { TypeaheadModule } from '../typeahead/typeahead.module'; 
import { DatetimePickerModule } from '../datetime-picker/datetime-picker.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarAddPageRoutingModule,
    TypeaheadModule,
    DatetimePickerModule 
  ],
  declarations: [CarAddPage]
})
export class CarAddPageModule {}