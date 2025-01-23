import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TollTaxPage } from './toll-tax.page';

const routes: Routes = [
  {
    path: '',
    component: TollTaxPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TollTaxPageRoutingModule {}
