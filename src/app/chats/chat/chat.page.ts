import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  chatId: string = '';
  messages: any[] = [];
  messageInput: string = '';
  currentUserId: string = '';
  private unsubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.currentUserId = await this.authService.getUserId();

    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.chatId = id;
        this.listenForMessages();
      } else {
        console.error('Chat ID is missing from the URL!');
      }
    });
  }

  async sendMessage() {
    if (!this.chatId || !this.messageInput.trim()) return;

    try {
      const username = await this.authService.getUsername();
      if (!username) {
        console.error('Username is missing!');
        return;
      }

      await this.chatService.sendMessage(
        this.chatId,
        this.messageInput,
        this.currentUserId,
        username
      );

      this.messageInput = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  listenForMessages() {
    this.unsubscribe = this.chatService.listenForMessages(this.chatId, (messages) => {
      this.messages = messages;
    });
  }
}
