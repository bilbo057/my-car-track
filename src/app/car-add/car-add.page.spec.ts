// car-add.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarAddPage } from './car-add.page';

describe('CarAddPage', () => {
  let component: CarAddPage;
  let fixture: ComponentFixture<CarAddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
