import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TypeaheadComponent } from './typeahead.component';

@NgModule({
  declarations: [TypeaheadComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule  // ✅ Import IonicModule to use Ionic UI components
  ],
  exports: [TypeaheadComponent]  // ✅ Export the component so other modules can use it
})
export class TypeaheadModule {}
