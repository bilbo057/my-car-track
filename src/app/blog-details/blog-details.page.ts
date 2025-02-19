import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.page.html',
  styleUrls: ['./blog-details.page.scss'],
})
export class BlogDetailsPage implements OnInit {
  blogId: string = '';
  blog: any;
  newComment: string = '';
  replyInputs: { [key: number]: string } = {}; // Track reply inputs for each comment

  constructor(private route: ActivatedRoute, private blogService: BlogService) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.blogId = params.get('id') || '';
      if (this.blogId) {
        await this.loadBlog();
      }
    });
  }

  async loadBlog() {
    this.blog = await this.blogService.getBlogById(this.blogId);
  }

  async addComment() {
    if (!this.newComment.trim()) return;

    await this.blogService.addComment(this.blogId, this.newComment);
    this.newComment = ''; // Clear input
    await this.loadBlog(); // Reload blog to reflect new comment
  }

  async addReply(commentIndex: number) {
    if (!this.replyInputs[commentIndex] || !this.replyInputs[commentIndex].trim()) return;

    await this.blogService.addReply(this.blogId, commentIndex, this.replyInputs[commentIndex]);
    this.replyInputs[commentIndex] = ''; // Clear reply input
    await this.loadBlog(); // Reload blog to reflect new reply
  }
}
