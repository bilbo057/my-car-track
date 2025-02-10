import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MechanicalBillsPage } from './mechanical-bills.page';

describe('MechanicalBillsPage', () => {
  let component: MechanicalBillsPage;
  let fixture: ComponentFixture<MechanicalBillsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MechanicalBillsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
