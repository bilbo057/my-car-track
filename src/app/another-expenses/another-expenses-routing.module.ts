import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnotherExpensesPage } from './another-expenses.page';

const routes: Routes = [
  {
    path: '',
    component: AnotherExpensesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnotherExpensesPageRoutingModule {}
