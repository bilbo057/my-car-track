import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.page.html',
  styleUrls: ['./ai-chat.page.scss'],
})
export class AiChatPage {
  messages: { role: 'user' | 'assistant'; content: string }[] = [
    {
      role: 'assistant',
      content: 'Това е вашият асистент с изкуствен интелект. Можете да задавате въпроси, свързани с коли, разходи, поддръжка, или българско законодателство.'
    }
  ];
  userInput: string = '';

  constructor(private http: HttpClient) {}

  sendMessage() {
    const content = this.userInput.trim();
    if (!content) return;

    this.messages.push({ role: 'user', content });
    this.userInput = '';
    this.queryGemini();
  }

  async queryGemini() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.geminiApiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Ти си помощник на български език и ако има въпрос свързан със закон ще отговаряш спрямо българските закони. Ще помагаш с коли, разходи и поддръжка. Отговаряй с кратки отговори (1–2 изречения).\n\n${this.messages.map(m => `${m.role === 'user' ? 'Потребител' : 'Помощник'}: ${m.content}`).join('\n')}`
            }
          ]
        }
      ]
    };

    try {
      const res: any = await this.http.post(url, payload).toPromise();
      const reply = res?.candidates?.[0]?.content?.parts?.[0]?.text || 'Няма отговор.';
      this.messages.push({ role: 'assistant', content: reply });
    } catch (error) {
      console.error('Gemini API error:', error);
      this.messages.push({
        role: 'assistant',
        content: 'Възникна грешка при заявката. Моля, опитайте отново.',
      });
    }
  }
}
