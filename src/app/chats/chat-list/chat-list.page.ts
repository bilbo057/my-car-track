import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc // ✅ IMPORTED
} from 'firebase/firestore';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
})
export class ChatListPage implements OnInit {
  chats: any[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];
  currentUserId: string = '';
  private firestore = getFirestore();

  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    this.currentUserId = await this.authService.getUserId();
    await this.loadChats();
  }

  async loadChats() {
    const q = query(collection(this.firestore, 'Chats'), where('participants', 'array-contains', this.currentUserId));
    const snapshot = await getDocs(q);

    const chatPromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const participants = data['participants'] as string[];
      const otherUserId = participants.find(id => id !== this.currentUserId);

      let otherUsername = 'Непознат';
      if (otherUserId) {
        const userDoc = await getDoc(doc(this.firestore, 'Users', otherUserId));
        otherUsername = userDoc.exists() ? userDoc.data()?.['username'] || 'Непознат' : 'Непознат';
      }

      return {
        id: docSnap.id,
        otherUserId,
        otherUsername,
        lastMessageTimestamp: data['lastMessageTimestamp'] || null,
      };
    });

    this.chats = await Promise.all(chatPromises);
  }

  async searchUsers() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    const q = query(
      collection(this.firestore, 'Users'),
      where('username', '>=', this.searchQuery.toLowerCase())
    );
    const snapshot = await getDocs(q);
    this.searchResults = snapshot.docs
      .map(doc => doc.data())
      .filter(user => user['UID'] !== this.currentUserId);
  }

  openChat(chatId: string) {
    this.router.navigate(['/chat', chatId]);
  }

  async startChat(user: any) {
    const userId = user['UID'];
    const chatsRef = collection(this.firestore, 'Chats');
    const q = query(chatsRef, where('participants', 'array-contains', this.currentUserId));
    const snapshot = await getDocs(q);

    const existingChat = snapshot.docs.find(doc =>
      (doc.data()['participants'] as string[]).includes(userId)
    );

    if (existingChat) {
      this.router.navigate(['/chat', existingChat.id]);
    } else {
      const newChatRef = doc(chatsRef); // ✅ generate new doc ref
      await setDoc(newChatRef, {
        participants: [this.currentUserId, userId],
        lastMessage: '',
        lastMessageTimestamp: null
      });
      this.router.navigate(['/chat', newChatRef.id]);
    }
  }
}
