import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarEditPage } from './car-edit.page';

const routes: Routes = [
  {
    path: '',
    component: CarEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarEditPageRoutingModule {}
