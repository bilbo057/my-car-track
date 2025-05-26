import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccessOwnershipPage } from './access-ownership.page';

const routes: Routes = [
  {
    path: '',
    component: AccessOwnershipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccessOwnershipPageRoutingModule {}
