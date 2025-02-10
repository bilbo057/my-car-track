import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearlyVehicleCheckPage } from './yearly-vehicle-check.page';

describe('YearlyVehicleCheckPage', () => {
  let component: YearlyVehicleCheckPage;
  let fixture: ComponentFixture<YearlyVehicleCheckPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(YearlyVehicleCheckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
