// blog-details.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogDetailsPage } from './blog-details.page';

describe('BlogDetailsPage', () => {
  let component: BlogDetailsPage;
  let fixture: ComponentFixture<BlogDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});