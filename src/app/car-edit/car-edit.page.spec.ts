// car-edit.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarEditPage } from './car-edit.page';

describe('CarEditPage', () => {
  let component: CarEditPage;
  let fixture: ComponentFixture<CarEditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
