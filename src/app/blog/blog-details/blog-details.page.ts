import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.page.html',
  styleUrls: ['./blog-details.page.scss'],
})
export class BlogDetailsPage implements OnInit {
  blogId: string = '';
  blog: any;
  newComment: string = '';
  isCommentLoading = false;
  replyLoading: { [key: number]: boolean } = {};
  replyInputs: { [key: number]: string } = {};
  showReplies: { [key: number]: boolean } = {};
  firestore = getFirestore();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

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
    this.showReplies = {};
    this.blog.comments?.forEach((_: any, i: number) => {
      this.showReplies[i] = false;
    });
    // Load usernames for blog author, comments, replies if needed
    if (this.blog.authorId && !this.blog.authorName) {
      this.blog.authorName = await this.getUsernameByUid(this.blog.authorId);
    }
    if (this.blog.comments && this.blog.comments.length) {
      for (let comment of this.blog.comments) {
        if (comment.userId && !comment.username) {
          comment.username = await this.getUsernameByUid(comment.userId);
        }
        if (comment.replies && comment.replies.length) {
          for (let reply of comment.replies) {
            if (reply.userId && !reply.username) {
              reply.username = await this.getUsernameByUid(reply.userId);
            }
          }
        }
      }
    }
  }

  async getUsernameByUid(uid: string): Promise<string> {
    try {
      const userDocRef = doc(this.firestore, 'Users', uid);
      const userSnap = await getDoc(userDocRef);
      return userSnap.exists() ? (userSnap.data()['username'] || 'Unknown') : 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  startChat(uid: string) {
    if (uid) {
      this.router.navigate(['/chat', uid]);
    }
  }

  async addComment() {
  if (!this.newComment.trim() || this.isCommentLoading) return;
  this.isCommentLoading = true;
  try {
    await this.blogService.addComment(this.blogId, this.newComment);
    this.newComment = '';
    await this.loadBlog();
  } finally {
    this.isCommentLoading = false;
  }
}

async addReply(commentIndex: number) {
  const replyText = this.replyInputs[commentIndex];
  if (!replyText || !replyText.trim() || this.replyLoading[commentIndex]) return;
  this.replyLoading[commentIndex] = true;
  try {
    await this.blogService.addReply(this.blogId, commentIndex, replyText.trim());
    this.replyInputs[commentIndex] = '';
    await this.loadBlog();
  } finally {
    this.replyLoading[commentIndex] = false;
  }
}


  toggleReplies(index: number) {
    this.showReplies[index] = !this.showReplies[index];
  }
}
