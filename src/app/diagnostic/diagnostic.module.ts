import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiagnosticPageRoutingModule } from './diagnostic-routing.module';

import { DiagnosticPage } from './diagnostic.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiagnosticPageRoutingModule
  ],
  declarations: [DiagnosticPage]
})
export class DiagnosticPageModule {}
