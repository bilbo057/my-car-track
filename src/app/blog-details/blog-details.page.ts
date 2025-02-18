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
  blog: any = {};
  commentText: string = '';

  constructor(private route: ActivatedRoute, private blogService: BlogService) {}

  async ngOnInit() {
    this.blogId = this.route.snapshot.paramMap.get('id') || '';
    this.blog = await this.blogService.getBlogById(this.blogId);
  }

  async addComment() {
    if (this.commentText.trim()) {
      await this.blogService.addComment(this.blogId, this.commentText);
      this.commentText = '';
      this.ngOnInit();
    }
  }
}
