// car-market.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarMarketPage } from './car-market.page';

describe('CarMarketPage', () => {
  let component: CarMarketPage;
  let fixture: ComponentFixture<CarMarketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarMarketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});