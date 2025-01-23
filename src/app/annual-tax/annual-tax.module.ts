import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnnualTaxPageRoutingModule } from './annual-tax-routing.module';

import { AnnualTaxPage } from './annual-tax.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnnualTaxPageRoutingModule
  ],
  declarations: [AnnualTaxPage]
})
export class AnnualTaxPageModule {}
