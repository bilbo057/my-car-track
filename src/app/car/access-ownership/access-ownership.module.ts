import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccessOwnershipPageRoutingModule } from './access-ownership-routing.module';

import { AccessOwnershipPage } from './access-ownership.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccessOwnershipPageRoutingModule
  ],
  declarations: [AccessOwnershipPage]
})
export class AccessOwnershipPageModule {}
