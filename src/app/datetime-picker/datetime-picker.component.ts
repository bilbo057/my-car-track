import { Component, ViewEncapsulation, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DatetimePickerComponent {
  @Output() dateSelected = new EventEmitter<string>();

  onDateChange(event: any) {
    this.dateSelected.emit(event.detail.value);
  }
}
