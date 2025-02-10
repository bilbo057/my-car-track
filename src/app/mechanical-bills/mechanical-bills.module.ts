import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MechanicalBillsPageRoutingModule } from './mechanical-bills-routing.module';

import { MechanicalBillsPage } from './mechanical-bills.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MechanicalBillsPageRoutingModule
  ],
  declarations: [MechanicalBillsPage]
})
export class MechanicalBillsPageModule {}
