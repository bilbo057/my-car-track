import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RefuelingPage } from './refueling.page';

describe('RefuelingPage', () => {
  let component: RefuelingPage;
  let fixture: ComponentFixture<RefuelingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RefuelingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
