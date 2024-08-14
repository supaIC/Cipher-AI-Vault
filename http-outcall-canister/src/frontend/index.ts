import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('azle-app')
export class AzleApp extends LitElement {
  @property() chatHistory: string = '';

  async sendMessage() {
    const promptInput = this.shadowRoot?.querySelector('#prompt') as HTMLInputElement;
    const modelSelect = this.shadowRoot?.querySelector('#model') as HTMLSelectElement;
    const maxTokensInput = this.shadowRoot?.querySelector('#maxTokens') as HTMLInputElement;
    const temperatureInput = this.shadowRoot?.querySelector('#temperature') as HTMLInputElement;

    if (
      !promptInput ||
      !modelSelect ||
      !maxTokensInput ||
      !temperatureInput
    ) {
      console.error('Failed to select necessary input elements');
      return;
    }

    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptInput.value,
        model: modelSelect.value,
        max_tokens: parseInt(maxTokensInput.value),
        temperature: parseFloat(temperatureInput.value),
      }),
    });

    const responseJson = await response.json();
    const message = responseJson.choices?.[0]?.message?.content;

    if (message) {
      this.chatHistory += `<p><strong>You:</strong> ${promptInput.value}</p>`;
      this.chatHistory += `<p><strong>Assistant:</strong> ${message}</p>`;
      promptInput.value = '';
    } else {
      console.error('Failed to retrieve message from response');
    }
  }

  render() {
    return html`
      <h1>OpenAI GPT-4 Chat</h1>
      <div id="chatHistory">${this.chatHistory}</div>
      <input type="text" id="prompt" placeholder="Enter your message">
      <select id="model">
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
      </select>
      <input type="number" id="maxTokens" placeholder="Max Tokens" value="100">
      <input type="number" id="temperature" placeholder="Temperature" step="0.1" value="0.7">
      <button @click=${this.sendMessage}>Send</button>
    `;
  }
}