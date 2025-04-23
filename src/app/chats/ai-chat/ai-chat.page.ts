import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.page.html',
  styleUrls: ['./ai-chat.page.scss'],
})
export class AiChatPage {
  messages: { role: 'user' | 'assistant'; content: string }[] = [];
  userInput: string = '';

  constructor(private http: HttpClient) {}

  sendMessage() {
    const content = this.userInput.trim();
    if (!content) return;

    this.messages.push({ role: 'user', content });
    this.userInput = '';
    this.queryAI();
  }

  async queryAI() {
    const apiKey = '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';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost', // or your deployed domain
      'X-Title': 'MyCarTrack AI',
    });

    const payload = {
      model: 'openai/gpt-3.5-turbo', // ✅ use GPT-3.5 first for testing (always works)
      messages: [
        {
          role: 'system',
          content: 'Ти си помощник на български език и ако има въпрос свързан със закон ще отговаряш спрямо българските закони, ще помагаш с коли, разходи и поддръжка по колите, ще отговаряш с кратки отговори от 1 до 2 изречения',
        },
        ...this.messages,
      ],
    };

    try {
      const res: any = await this.http
        .post('https://openrouter.ai/api/v1/chat/completions', payload, { headers })
        .toPromise();

      const reply = res?.choices?.[0]?.message?.content || 'Няма отговор.';
      this.messages.push({ role: 'assistant', content: reply });
    } catch (error) {
      console.error('AI API error:', error);
      this.messages.push({
        role: 'assistant',
        content: '⚠️ Възникна грешка при заявката. Моля, опитайте отново.',
      });
    }
  }
}
