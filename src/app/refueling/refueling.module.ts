import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefuelingPageRoutingModule } from './refueling-routing.module';

import { RefuelingPage } from './refueling.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefuelingPageRoutingModule
  ],
  declarations: [RefuelingPage]
})
export class RefuelingPageModule {}
