// car-listing.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarListingPage } from './car-listing.page';

describe('CarListingPage', () => {
  let component: CarListingPage;
  let fixture: ComponentFixture<CarListingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});