import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item } from './types';

@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss']
})
export class TypeaheadComponent {
  @Input() title: string = '';
  @Input() items: Item[] = [];
  @Input() selectedItems: string[] = [];  // ✅ Fix: Use selectedItems instead of selectedItem
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() selectionCancel = new EventEmitter<void>();

  searchText: string = '';

  get filteredItems(): Item[] {
    return this.items.filter(item => 
      item.text.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectItem(item: Item) {
    this.selectionChange.emit([item.value]);  // ✅ Emits an array
  }

  clearSearch() {
    this.searchText = '';
  }
}
