import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCarPage } from './add-car.page';

describe('AddCarPage', () => {
  let component: AddCarPage;
  let fixture: ComponentFixture<AddCarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
