// annual-tax.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnualTaxPage } from './annual-tax.page';

describe('AnnualTaxPage', () => {
  let component: AnnualTaxPage;
  let fixture: ComponentFixture<AnnualTaxPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualTaxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
