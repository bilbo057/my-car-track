import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonthlyExpensesPage } from './monthly-expenses.page';

const routes: Routes = [
  {
    path: '',
    component: MonthlyExpensesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonthlyExpensesPageRoutingModule {}
