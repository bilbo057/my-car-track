import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnotherExpensesPageRoutingModule } from './another-expenses-routing.module';

import { AnotherExpensesPage } from './another-expenses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnotherExpensesPageRoutingModule
  ],
  declarations: [AnotherExpensesPage]
})
export class AnotherExpensesPageModule {}
