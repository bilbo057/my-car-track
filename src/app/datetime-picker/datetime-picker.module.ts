import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatetimePickerComponent } from './datetime-picker.component';

@NgModule({
  declarations: [DatetimePickerComponent],
  imports: [CommonModule, FormsModule, IonicModule], // Ensure IonicModule is here
  exports: [DatetimePickerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // This allows custom Ionic elements
})
export class DatetimePickerModule {}
