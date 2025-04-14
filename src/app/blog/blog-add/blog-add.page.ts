import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-add',
  templateUrl: './blog-add.page.html',
  styleUrls: ['./blog-add.page.scss'],
})
export class BlogAddPage {
  showValidation = false;
  title: string = '';
  content: string = '';

  constructor(private blogService: BlogService, private router: Router) {}

  async submitBlog() {
    this.showValidation = true;
  
    if (!this.title.trim() || !this.content.trim() || this.content.length > 5000) {
      return;
    }
  
    try {
      await this.blogService.addBlog(this.title.trim(), this.content.trim());
  
      // Reset form
      this.title = '';
      this.content = '';
      this.showValidation = false;
  
      // Navigate
      this.router.navigate(['/blog-list']);
    } catch (error) {
      console.error('Error submitting blog:', error);
    }
  }  
}
