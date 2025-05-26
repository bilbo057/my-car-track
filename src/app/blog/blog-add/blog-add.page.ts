import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-blog-add',
  templateUrl: './blog-add.page.html',
  styleUrls: ['./blog-add.page.scss'],
})
export class BlogAddPage {
  showValidation = false;
  title: string = '';
  content: string = '';

  // Validation max lengths
  readonly TITLE_MAX = 60;
  readonly CONTENT_MAX = 10000;

  constructor(private blogService: BlogService, private router: Router, private authService: AuthService) {}

  get titleLength() {
    return this.title.length;
  }

  get contentLength() {
    return this.content.length;
  }

  get isTitleValid() {
    return !!this.title.trim() && this.title.length <= this.TITLE_MAX;
  }

  get isContentValid() {
    return !!this.content.trim() && this.content.length <= this.CONTENT_MAX;
  }

  get canSubmit() {
    return this.isTitleValid && this.isContentValid;
  }

  async submitBlog() {
    this.showValidation = true;
    if (!this.canSubmit) return;

    try {
      const uid = await this.authService.getUserId();
      await this.blogService.addBlog(this.title.trim(), this.content.trim(), uid);

      this.title = '';
      this.content = '';
      this.showValidation = false;
      this.router.navigate(['/blog-list']);
    } catch (error) {
      console.error('Error submitting blog:', error);
    }
  }
}
