import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarAddPageRoutingModule } from './car-add-routing.module';

import { CarAddPage } from './car-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarAddPageRoutingModule
  ],
  declarations: [CarAddPage]
})
export class CarAddPageModule {}
