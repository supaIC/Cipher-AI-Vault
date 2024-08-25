import { html, LitElement } from 'lit';
import { customElement, property } from "lit/decorators.js";

@customElement('azle-app')
export class AzleApp extends LitElement {
  @property() chatHistory: string = '';

  async sendMessage() {
    console.log('sendMessage() called');

    const promptInput = this.shadowRoot?.querySelector('#prompt') as HTMLInputElement;
    const modelSelect = this.shadowRoot?.querySelector('#model') as HTMLSelectElement;
    const maxTokensInput = this.shadowRoot?.querySelector('#maxTokens') as HTMLInputElement;
    const temperatureInput = this.shadowRoot?.querySelector('#temperature') as HTMLInputElement;

    console.log('Input elements:', {
      promptInput,
      modelSelect,
      maxTokensInput,
      temperatureInput
    });

    if (
      !promptInput ||
      !modelSelect ||
      !maxTokensInput ||
      !temperatureInput
    ) {
      console.error('Failed to select necessary input elements');
      return;
    }

    const promptValue = promptInput.value;
    const modelValue = modelSelect.value;
    const maxTokensValue = parseInt(maxTokensInput.value);
    const temperatureValue = parseFloat(temperatureInput.value);

    console.log('Form values:', {
      promptValue,
      modelValue,
      maxTokensValue,
      temperatureValue
    });

    try {
      const requestBody = JSON.stringify({
        prompt: promptValue,
        model: modelValue,
        max_tokens: maxTokensValue,
        temperature: temperatureValue,
      });

      console.log('Request body:', requestBody);

      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      console.log('Fetch response:', response);

      const responseJson = await response.json();

      console.log('Response JSON:', responseJson);

      const message = responseJson.choices?.[0]?.message?.content;

      console.log('Extracted message:', message);

      if (message) {
        this.chatHistory += `<p><strong>You:</strong> ${promptValue}</p>`;
        this.chatHistory += `<p><strong>Assistant:</strong> ${message}</p>`;
        promptInput.value = '';
      } else {
        console.error('Failed to retrieve message from response');
      }
    } catch (error) {
      console.error('Error in sendMessage():', error);
    }
  }

  render() {
    console.log('Rendering component');
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
