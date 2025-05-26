import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccessOwnershipPage } from './access-ownership.page';

describe('AccessOwnershipPage', () => {
  let component: AccessOwnershipPage;
  let fixture: ComponentFixture<AccessOwnershipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessOwnershipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
