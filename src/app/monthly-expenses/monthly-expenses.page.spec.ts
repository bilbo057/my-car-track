// monthly-expenses.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthlyExpensesPage } from './monthly-expenses.page';

describe('MonthlyExpensesPage', () => {
  let component: MonthlyExpensesPage;
  let fixture: ComponentFixture<MonthlyExpensesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});