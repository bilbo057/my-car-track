// chat.service.ts
import { Injectable } from '@angular/core';
import { getFirestore, collection, query, where, getDocs, orderBy, addDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = getFirestore();

  constructor(private authService: AuthService) {}

  // Listen for chat messages in real-time
  listenForMessages(chatId: string, callback: (messages: any[]) => void) {
    if (!chatId) {
      console.error('Chat ID is undefined.');
      return;
    }

    const chatDocRef = doc(this.firestore, 'Chats', chatId);
    const messagesRef = collection(chatDocRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(messages);
      } else {
        console.warn('No messages found for this chat.');
        callback([]);
      }
    }, (error) => {
      console.error('Error fetching messages:', error);
    });
  }

  // Send a message
  async sendMessage(chatId: string, messageText: string) {
    if (!chatId) {
      console.error('ERROR: Chat ID is undefined! Cannot send message.');
      return;
    }

    if (!messageText.trim()) {
      console.error('ERROR: Message text is empty.');
      return;
    }

    const userId = await this.authService.getUserId();
    if (!userId) {
      console.error('ERROR: User ID is undefined.');
      return;
    }

    try {
      const messagesRef = collection(this.firestore, 'Chats', chatId, 'messages');
      await addDoc(messagesRef, {
        senderId: userId,
        text: messageText,
        timestamp: serverTimestamp(),
      });

      console.log('Message sent successfully.');
    } catch (error) {
      console.error('ERROR sending message:', error);
    }
  }

  // Get all user chats
  async getUserChats() {
    const userId = await this.authService.getUserId();
    if (!userId) {
      console.error('User ID is undefined.');
      return [];
    }

    try {
      const q = query(collection(this.firestore, 'Chats'), where('participants', 'array-contains', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user chats:', error);
      return [];
    }
  }

  async createOrGetChat(otherUserId: string): Promise<string | null> {
    const userId = await this.authService.getUserId();
    if (!userId) return null;

    // Prevent users from starting a chat with themselves
    if (userId === otherUserId) {
      console.error('Cannot start a chat with oneself');
      return null;
    }

    const chatsRef = collection(this.firestore, 'Chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));

    const snapshot = await getDocs(q);
    const existingChat = snapshot.docs.find(doc => {
      const participants = doc.data()['participants'] as Array<string>;
      return participants.includes(otherUserId);
    });

    if (existingChat) {
      return existingChat.id;
    } else {
      const newChatRef = await addDoc(chatsRef, {
        participants: [userId, otherUserId],
        lastMessage: '',
        lastMessageTimestamp: null
      });
      return newChatRef.id;
    }
  }
}
