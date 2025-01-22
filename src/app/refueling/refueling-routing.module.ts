import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefuelingPage } from './refueling.page';

const routes: Routes = [
  {
    path: '',
    component: RefuelingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefuelingPageRoutingModule {}
