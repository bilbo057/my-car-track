import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TollTaxPage } from './toll-tax.page';

describe('TollTaxPage', () => {
  let component: TollTaxPage;
  let fixture: ComponentFixture<TollTaxPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TollTaxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
