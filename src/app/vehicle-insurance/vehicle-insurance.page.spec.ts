import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleInsurancePage } from './vehicle-insurance.page';

describe('VehicleInsurancePage', () => {
  let component: VehicleInsurancePage;
  let fixture: ComponentFixture<VehicleInsurancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleInsurancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
