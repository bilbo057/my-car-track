// mechanical-bills-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MechanicalBillsPage } from './mechanical-bills.page';

const routes: Routes = [
  {
    path: '',
    component: MechanicalBillsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MechanicalBillsPageRoutingModule {}