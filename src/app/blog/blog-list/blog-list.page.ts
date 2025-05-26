import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { getFirestore, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.page.html',
  styleUrls: ['./blog-list.page.scss'],
})
export class BlogListPage {
  blogs: any[] = [];
  searchTerm: string = '';
  currentUserId: string = '';
  firestore = getFirestore();

  constructor(
    private blogService: BlogService,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  async ionViewWillEnter() {
    this.currentUserId = await this.authService.getUserId();
    await this.loadBlogs();
  }

  async loadBlogs() {
    const blogsRaw = await this.blogService.getAllBlogs();
    this.blogs = await Promise.all(
      blogsRaw.map(async (blog: any) => {
        const authorId = blog.authorId || blog.authorID || blog.uid || null;
        let username = 'Unknown';
        if (authorId) {
          username = await this.getUsernameByUid(authorId);
        }
        return { ...blog, authorUsername: username, authorId };
      })
    );
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

  searchBlogs() {
    if (!this.searchTerm.trim()) {
      this.ionViewWillEnter();
      return;
    }
    this.blogs = this.blogs.filter(blog =>
      blog.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openBlog(blogId: string) {
    this.router.navigate(['/blog-details', blogId]);
  }

  startChat(uid: string) {
    this.router.navigate(['/chat', uid]);
  }

  async deleteBlog(blogId: string) {
    const alert = await this.alertController.create({
      header: 'Изтриване на публикация',
      message: 'Сигурни ли сте, че искате да изтриете този блог? Това действие е необратимо.',
      cssClass: 'custom-delete-alert',
      buttons: [
        {
          text: 'Отказ',
          role: 'cancel',
          cssClass: 'alert-cancel-btn'
        },
        {
          text: 'Изтрий',
          cssClass: 'alert-delete-btn',
          handler: async () => {
            try {
              await deleteDoc(doc(this.firestore, 'Blogs', blogId));
              await this.loadBlogs();
            } catch (error) {
              console.error('Грешка при изтриване на блога:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}