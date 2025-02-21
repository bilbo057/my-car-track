// maintaining.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintainingPage } from './maintaining.page';

describe('MaintainingPage', () => {
  let component: MaintainingPage;
  let fixture: ComponentFixture<MaintainingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintainingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});