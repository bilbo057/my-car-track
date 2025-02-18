import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  chatId: string = '';
  messages: any[] = [];
  newMessage: string = '';
  currentUserId: string = '';
  private unsubscribe: any;
  messageInput: string = '';

  constructor(private route: ActivatedRoute, private chatService: ChatService, private authService: AuthService) {}

  async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id'); // Get ID from route parameters
      console.log('Extracted Chat ID:', id); // Debugging output

      if (id) {
        this.chatId = id; // Assign it properly
        console.log('Chat ID assigned:', this.chatId); // Debugging output
        this.listenForMessages();
      } else {
        console.error('Chat ID is missing from the URL!');
      }
    });
  }

  async sendMessage() {
    if (!this.chatId) {
      console.error('Chat ID is missing! Cannot send message.');
      return;
    }

    if (!this.messageInput.trim()) {
      console.error('Message is empty.');
      return;
    }

    try {
      await this.chatService.sendMessage(this.chatId, this.messageInput);
      this.messageInput = ''; // Clear input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe(); // Stop listening when page is destroyed
  }

  listenForMessages() {
    if (!this.chatId) {
      console.error('Chat ID is missing! Cannot listen for messages.');
      return;
    }

    this.chatService.listenForMessages(this.chatId, (messages) => {
      this.messages = messages;
    });
  }
}
