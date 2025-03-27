// blog-add.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BlogAddPageRoutingModule } from './blog-add-routing.module';
import { BlogAddPage } from './blog-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlogAddPageRoutingModule
  ],
  declarations: [BlogAddPage]
})
export class BlogAddPageModule {}