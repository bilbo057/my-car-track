import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiagnosticPage } from './diagnostic.page';

const routes: Routes = [
  {
    path: '',
    component: DiagnosticPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiagnosticPageRoutingModule {}
