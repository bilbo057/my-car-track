// blog-add-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlogAddPage } from './blog-add.page';

const routes: Routes = [
  {
    path: '',
    component: BlogAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlogAddPageRoutingModule {}