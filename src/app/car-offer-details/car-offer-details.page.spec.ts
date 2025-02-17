import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarOfferDetailsPage } from './car-offer-details.page';

describe('CarOfferDetailsPage', () => {
  let component: CarOfferDetailsPage;
  let fixture: ComponentFixture<CarOfferDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarOfferDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
