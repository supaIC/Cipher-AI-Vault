import { html, LitElement } from 'lit';
import { customElement, property } from "lit/decorators.js";

/**
 * @class AzleApp
 * @extends LitElement
 * @description A custom LitElement component designed to interact with an AI model through a simple chat interface. 
 * It captures user inputs, sends them to an API endpoint, and displays the generated responses.
 */
@customElement('azle-app')
export class AzleApp extends LitElement {
  
  /**
   * @property {string} chatHistory
   * @description Holds the chat history, including both user inputs and AI-generated responses. 
   * The history is displayed in the component's template.
   */
  @property() chatHistory: string = '';

  /**
   * @method sendMessage
   * @description Handles the logic for sending a user input (prompt) to an AI model, retrieving the response,
   * and updating the chat history. It also handles error cases where input elements are missing or the API call fails.
   */
  async sendMessage() {
    console.log('sendMessage() called');

    // Query the necessary input elements from the shadow DOM
    const promptInput = this.shadowRoot?.querySelector('#prompt') as HTMLInputElement;
    const modelSelect = this.shadowRoot?.querySelector('#model') as HTMLSelectElement;
    const maxTokensInput = this.shadowRoot?.querySelector('#maxTokens') as HTMLInputElement;
    const temperatureInput = this.shadowRoot?.querySelector('#temperature') as HTMLInputElement;

    // Log the input elements for debugging purposes
    console.log('Input elements:', {
      promptInput,
      modelSelect,
      maxTokensInput,
      temperatureInput
    });

    // Ensure all input elements are successfully queried before proceeding
    if (
      !promptInput ||
      !modelSelect ||
      !maxTokensInput ||
      !temperatureInput
    ) {
      console.error('Failed to select necessary input elements');
      return; // Exit if any input element is missing
    }

    // Retrieve and parse values from the input elements
    const promptValue = promptInput.value;
    const modelValue = modelSelect.value;
    const maxTokensValue = parseInt(maxTokensInput.value);
    const temperatureValue = parseFloat(temperatureInput.value);

    // Log the values retrieved from the form inputs for debugging purposes
    console.log('Form values:', {
      promptValue,
      modelValue,
      maxTokensValue,
      temperatureValue
    });

    try {
      // Prepare the request payload as a JSON string
      const requestBody = JSON.stringify({
        prompt: promptValue, // The user's input prompt
        model: modelValue, // Selected model (e.g., GPT-4 or GPT-3.5 Turbo)
        max_tokens: maxTokensValue, // Maximum tokens in the generated response
        temperature: temperatureValue, // Temperature setting for creativity
      });

      // Log the request payload for debugging purposes
      console.log('Request body:', requestBody);

      // Send the request to the backend API to generate a response from the AI model
      const response = await fetch('/chat', {
        method: 'POST', // POST method for sending data to the server
        headers: { 'Content-Type': 'application/json' }, // Specify the content type as JSON
        body: requestBody, // Include the JSON payload in the request body
      });

      // Log the entire fetch response object for debugging purposes
      console.log('Fetch response:', response);

      // Parse the JSON response from the backend
      const responseJson = await response.json();

      // Log the parsed JSON response for debugging purposes
      console.log('Response JSON:', responseJson);

      // Extract the generated message from the response, if available
      const message = responseJson.choices?.[0]?.message?.content;

      // Log the extracted message for debugging purposes
      console.log('Extracted message:', message);

      if (message) {
        // If a message was successfully retrieved, update the chat history
        this.chatHistory += `<p><strong>You:</strong> ${promptValue}</p>`;
        this.chatHistory += `<p><strong>Assistant:</strong> ${message}</p>`;
        promptInput.value = ''; // Clear the input field after sending the message
      } else {
        // Log an error if no message was retrieved from the response
        console.error('Failed to retrieve message from response');
      }
    } catch (error) {
      // Catch and log any errors that occur during the API call or response processing
      console.error('Error in sendMessage():', error);
    }
  }

  /**
   * @method render
   * @description Renders the HTML structure of the component, including the input fields, buttons,
   * and the chat history display area.
   * 
   * @returns {TemplateResult} The HTML structure as a LitElement template.
   */
  render() {
    console.log('Rendering component');
    return html`
      <h1>OpenAI GPT-4 Chat</h1>
      <div id="chatHistory">${this.chatHistory}</div> <!-- Display the chat history -->
      <input type="text" id="prompt" placeholder="Enter your message"> <!-- Input for user prompt -->
      <select id="model"> <!-- Dropdown for selecting the AI model -->
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
      </select>
      <input type="number" id="maxTokens" placeholder="Max Tokens" value="100"> <!-- Input for max tokens -->
      <input type="number" id="temperature" placeholder="Temperature" step="0.1" value="0.7"> <!-- Input for temperature -->
      <button @click=${this.sendMessage}>Send</button> <!-- Button to trigger sendMessage() -->
    `;
  }
}
