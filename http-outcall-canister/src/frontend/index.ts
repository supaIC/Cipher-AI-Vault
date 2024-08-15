import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('azle-app')
export class AzleApp extends LitElement {
  @property() chatHistory: string = '';

  async sendMessage() {
    const promptInput = this.shadowRoot?.querySelector('#prompt') as HTMLInputElement;

    if (!promptInput) {
      console.error('Failed to select necessary input elements');
      return;
    }

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptInput.value }],
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseJson = await response.json();
      const message = responseJson?.content?.[0]?.text; // Adjust based on actual response structure

      if (message) {
        this.chatHistory += `<p><strong>You:</strong> ${promptInput.value}</p>`;
        this.chatHistory += `<p><strong>Assistant:</strong> ${message}</p>`;
        promptInput.value = '';
      } else {
        console.error('Failed to retrieve message from response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  render() {
    return html`
      <h1>Anthropic Claude Chat</h1>
      <div id="chatHistory">${this.chatHistory}</div>
      <input type="text" id="prompt" placeholder="Enter your message">
      <button @click=${this.sendMessage}>Send</button>
    `;
  }
}
