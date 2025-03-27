// another-expenses.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AnotherExpensesPageRoutingModule } from './another-expenses-routing.module';
import { AnotherExpensesPage } from './another-expenses.page';
import { DatetimePickerModule } from "../../../datetime-picker/datetime-picker.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnotherExpensesPageRoutingModule,
    DatetimePickerModule
],
  declarations: [AnotherExpensesPage]
})
export class AnotherExpensesPageModule {}