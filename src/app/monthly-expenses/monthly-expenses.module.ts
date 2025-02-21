// monthly-expenses.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MonthlyExpensesPageRoutingModule } from './monthly-expenses-routing.module';
import { MonthlyExpensesPage } from './monthly-expenses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonthlyExpensesPageRoutingModule
  ],
  declarations: [MonthlyExpensesPage]
})
export class MonthlyExpensesPageModule {}