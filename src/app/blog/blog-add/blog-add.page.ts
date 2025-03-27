// blog-add.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-add',
  templateUrl: './blog-add.page.html',
  styleUrls: ['./blog-add.page.scss'],
})
export class BlogAddPage {
  title: string = '';
  content: string = '';

  constructor(private blogService: BlogService, private router: Router) {}

  async submitBlog() {
    if (this.title.trim() && this.content.trim()) {
      await this.blogService.addBlog(this.title, this.content);
      this.router.navigate(['/blog-list']);
    }
  }
}