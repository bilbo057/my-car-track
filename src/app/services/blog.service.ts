import { Injectable } from '@angular/core';
import { 
  getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, serverTimestamp 
} from 'firebase/firestore';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private firestore = getFirestore();

  constructor(private authService: AuthService) {}

  async getAllBlogs() {
    const querySnapshot = await getDocs(collection(this.firestore, 'Blogs'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getBlogById(blogId: string) {
    const blogDoc = await getDoc(doc(this.firestore, 'Blogs', blogId));
    return blogDoc.exists() ? { id: blogDoc.id, ...blogDoc.data() } : null;
  }

  async addBlog(title: string, content: string) {
    const userId = await this.authService.getUserId();
    const username = await this.authService.getUsername();

    if (!userId || !username) return;

    await addDoc(collection(this.firestore, 'Blogs'), {
      title,
      content,
      authorId: userId,
      authorName: username,
      timestamp: serverTimestamp(),
      comments: [] // Ensure comments field exists as an empty array initially
    });
  }

  async addComment(blogId: string, text: string) {
    const userId = await this.authService.getUserId();
    const username = await this.authService.getUsername();
    if (!userId || !username) return;

    const blogRef = doc(this.firestore, 'Blogs', blogId);
    const blogDoc = await getDoc(blogRef);

    if (blogDoc.exists()) {
      const blogData = blogDoc.data();
      const updatedComments: any[] = blogData?.['comments'] ? [...blogData['comments']] : [];

      const timestamp = new Date().toISOString(); // Manually create a timestamp

      updatedComments.push({
        userId,
        username,
        text,
        timestamp,
        replies: [] // Ensure replies array exists
      });

      await updateDoc(blogRef, { comments: updatedComments });
    }
  }

  async addReply(blogId: string, commentIndex: number, replyText: string) {
    const userId = await this.authService.getUserId();
    const username = await this.authService.getUsername();
    if (!userId || !username) return;

    const blogRef = doc(this.firestore, 'Blogs', blogId);
    const blogDoc = await getDoc(blogRef);

    if (blogDoc.exists()) {
      const blogData = blogDoc.data();
      const updatedComments: any[] = blogData?.['comments'] ? [...blogData['comments']] : [];

      if (updatedComments[commentIndex]) {
        updatedComments[commentIndex]['replies'].push({
          userId,
          username,
          text: replyText,
          timestamp: new Date().toISOString() // Use ISO timestamp
        });

        await updateDoc(blogRef, { comments: updatedComments });
      }
    }
  }
}
