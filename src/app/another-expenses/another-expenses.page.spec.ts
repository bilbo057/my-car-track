import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnotherExpensesPage } from './another-expenses.page';

describe('AnotherExpensesPage', () => {
  let component: AnotherExpensesPage;
  let fixture: ComponentFixture<AnotherExpensesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnotherExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
