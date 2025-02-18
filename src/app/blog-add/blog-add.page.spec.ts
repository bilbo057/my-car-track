import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogAddPage } from './blog-add.page';

describe('BlogAddPage', () => {
  let component: BlogAddPage;
  let fixture: ComponentFixture<BlogAddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
