// This is a test of running larger WebGPU LLM in the browser and in an Internet Computer canister.
// Ideally, we would consider reskinning web-llm chat, adding in awareness of files in your wallet + IC login, etc: https://github.com/mlc-ai/web-llm-chat

// We use the Hugging Face import instead of the Xennova import.
// Transformers.js is what we ideally want to use. Using alternatives like 'onnxruntime-web' directly can cause issues with WASM minification and other unknown issues.
import { pipeline } from '@huggingface/transformers';
// We use lit for easy HTML testing.
import { html, LitElement } from 'lit';

class AzleApp extends LitElement {
  constructor() {
    super();
    this.chatHistory = '';
  }

  static pipelineInstance = null;

  async firstUpdated() {
    try {
      if (!AzleApp.pipelineInstance) {
        // Intended to initialize the pipeline directly.
        // We plan to use this model: https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16
        // ISSUE: This does not work directly because we encounter the following error: 
        // GET https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16/resolve/main/onnx/model_quantized.onnx 404 (Not Found)
        // Instead, we should use these links: 
        // https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16/resolve/main/onnx/model_q4.onnx 
        // https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16/resolve/main/onnx/model_q4.onnx_data
        // CHALLENGE: The issue is that we cannot directly set the download link using the "pipeline" function.
        
        // OPTION 1: Loading Model and Data from Hugging Face URLs
        // - Fetch model files (onnx & onnx_data) directly from Hugging Face at runtime.
        // - This approach can face CORS issues and potential 404 errors if URLs are incorrect.
        
        // OPTION 2: Upload Models to Asset Canister
        // - Upload the models to the asset canister during deployment and load them at runtime.
        // - Update `dfx.json` and build configuration to ensure models are packaged and deployed correctly.
        // - Ensures models are always available and avoid runtime network issues.

        // ALTERNATIVE OPTION: Using ONNX Runtime Directly
        // - We could use the `onnxruntime-web` library to manually load and run the ONNX model.
        // - This would involve fetching the ONNX model and data files manually and then running inference using `InferenceSession`.
        // - Example:
        //   import { InferenceSession } from 'onnxruntime-web';
        //   const session = await InferenceSession.create('/path/to/model_q4.onnx');
        //   const inputTensor = new onnx.Tensor('float32', inputData, [1, inputLength]);
        //   const feeds = { input: inputTensor };
        //   const results = await session.run(feeds);
        // - PROS: Full control over model loading and execution.
        // - CONS: Requires more manual setup, including handling data files and potential issues with WASM in the browser.
        
        // CURRENT STATE: The code attempts to load the model directly via Hugging Face, which fails.
        AzleApp.pipelineInstance = await pipeline('text-generation', 'Xenova/Phi-3-mini-4k-instruct_fp16');
      }
    } catch (error) {
      console.error('Error initializing the pipeline:', error);
    }
  }

  async sendMessage() {
    const promptInput = this.shadowRoot?.querySelector('#prompt');

    if (!promptInput) {
      console.error('Failed to select necessary input element');
      return;
    }

    const promptValue = promptInput.value;

    try {
      // Ensure that pipelineInstance is a function before calling it.
      if (typeof AzleApp.pipelineInstance !== 'function') {
        throw new TypeError('pipelineInstance is not a function');
      }

      // Generate text based on the input prompt.
      const generatedText = await AzleApp.pipelineInstance(promptValue, {
        max_length: 100,  // Adjust max token length as needed.
        temperature: 0.7,  // Adjust temperature for creativity.
      });

      if (generatedText) {
        // Append generated text to the chat history.
        this.chatHistory += `<p><strong>You:</strong> ${promptValue}</p>`;
        this.chatHistory += `<p><strong>Assistant:</strong> ${generatedText[0]?.generated_text || ''}</p>`;
        this.requestUpdate();
        promptInput.value = '';
      } else {
        console.error('Failed to retrieve generated text');
      }
    } catch (error) {
      console.error('Error in sendMessage():', error);
    }
  }

  render() {
    return html`
      <h1>Text Generation</h1>
      <div id="chatHistory">${this.chatHistory}</div>
      <input type="text" id="prompt" placeholder="Enter your message">
      <button @click=${() => this.sendMessage()}>Generate Text</button>
    `;
  }
}

customElements.define('azle-app', AzleApp);
