// chat-list.page.ts
import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.page.html',
  styleUrls: ['./chat-list.page.scss'],
})
export class ChatListPage implements OnInit {
  chats: any[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];
  private firestore = getFirestore();

  constructor(private chatService: ChatService, private router: Router) {}

  async ngOnInit() {
    this.chats = await this.chatService.getUserChats();
  }

  async searchUsers() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    const usersRef = collection(this.firestore, 'Users');
    const q = query(usersRef, where('username', '>=', this.searchQuery), where('username', '<=', this.searchQuery + '\uf8ff'));
    const snapshot = await getDocs(q);

    this.searchResults = snapshot.docs.map(doc => ({
      UID: doc.id,
      username: doc.data()['username'],
    }));
    
  }

  async startChat(user: any) {
    const chatId = await this.chatService.createOrGetChat(user.UID);
    this.router.navigate(['/chat', chatId]);
  }

  openChat(chatId: string) {
    this.router.navigate(['/chat', chatId]);
  }
}