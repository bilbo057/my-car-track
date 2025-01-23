import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnnualTaxPage } from './annual-tax.page';

const routes: Routes = [
  {
    path: '',
    component: AnnualTaxPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnnualTaxPageRoutingModule {}
