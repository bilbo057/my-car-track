import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaintainingPage } from './maintaining.page';

const routes: Routes = [
  {
    path: '',
    component: MaintainingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaintainingPageRoutingModule {}
