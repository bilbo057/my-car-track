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
    const username = await this.authService.getUsername(); // Fetch username once

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
      
      // Ensure 'comments' exists and is an array
      const updatedComments: any[] = blogData?.['comments'] ? [...blogData['comments']] : [];
  
      // First, get a manual timestamp
      const timestamp = new Date().toISOString(); 
  
      // Push the new comment with manually created timestamp
      updatedComments.push({
        userId,
        username,
        text,
        timestamp, // Store as a string instead of serverTimestamp()
      });
  
      // Update Firestore document
      await updateDoc(blogRef, { comments: updatedComments });
    }
  }
}
