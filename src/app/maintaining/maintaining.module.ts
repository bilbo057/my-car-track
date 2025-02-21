// maintaining.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MaintainingPageRoutingModule } from './maintaining-routing.module';
import { MaintainingPage } from './maintaining.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaintainingPageRoutingModule
  ],
  declarations: [MaintainingPage]
})
export class MaintainingPageModule {}