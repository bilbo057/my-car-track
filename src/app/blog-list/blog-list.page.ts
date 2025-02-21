// blog-list.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.page.html',
  styleUrls: ['./blog-list.page.scss'],
})
export class BlogListPage implements OnInit {
  blogs: any[] = [];
  searchTerm: string = '';

  constructor(private blogService: BlogService, private router: Router) {}

  async ngOnInit() {
    this.blogs = await this.blogService.getAllBlogs();
  }

  searchBlogs() {
    if (!this.searchTerm.trim()) {
      this.ngOnInit();
      return;
    }

    this.blogs = this.blogs.filter(blog => 
      blog.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openBlog(blogId: string) {
    this.router.navigate(['/blog-details', blogId]);
  }
}