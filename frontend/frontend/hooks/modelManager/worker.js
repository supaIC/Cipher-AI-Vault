import {
    AutoTokenizer,
    AutoModelForCausalLM,
    TextStreamer,
    StoppingCriteria,
} from '@huggingface/transformers';
import { modelsConfig } from './modelsConfig'; // Import the centralized modelsConfig

// Custom streamer class to handle the callback after text generation
class CallbackTextStreamer extends TextStreamer {
    constructor(tokenizer, cb) {
        super(tokenizer, {
            skip_prompt: true,             // Skip the initial prompt during streaming
            skip_special_tokens: true,     // Skip special tokens in the output
        });
        this.cb = cb;  // Callback function to process the finalized text
    }

    // Called when the text generation is finalized
    on_finalized_text(text) {
        this.cb(text);
    }
}

// Custom stopping criteria to allow interruption during text generation
class InterruptableStoppingCriteria extends StoppingCriteria {
    constructor() {
        super();
        this.interrupted = false; // Flag to track if generation has been interrupted
    }

    // Method to interrupt the generation
    interrupt() {
        this.interrupted = true;
    }

    // Reset the interruption flag
    reset() {
        this.interrupted = false;
    }

    // Override the call method to return the interruption status
    _call(input_ids, scores) {
        return new Array(input_ids.length).fill(this.interrupted);  // Return true for all tokens if interrupted
    }
}

// Instantiate the stopping criteria object
const stopping_criteria = new InterruptableStoppingCriteria();

// Pipeline class for text generation that handles model and tokenizer loading
class TextGenerationPipeline {
    static model_id = null;  // Static variable to store the model ID
    static model = null;     // Static variable to store the model instance
    static tokenizer = null; // Static variable to store the tokenizer instance

    static async getInstance(model_id, progress_callback = null) {
        // Check if the model_id exists in modelsConfig
        const modelConfig = modelsConfig.find(m => m.model_id === model_id);
        if (!modelConfig) {
            throw new Error(`Model ID "${model_id}" not found in modelsConfig.`);
        }

        // Avoid reloading if the model is already loaded
        if (this.model_id === model_id && this.model && this.tokenizer) {
            return [this.tokenizer, this.model];
        }

        // Set the new model_id and reset the model and tokenizer
        this.model_id = model_id;
        this.model = null;
        this.tokenizer = null;

        // Load the tokenizer if not already loaded
        if (!this.tokenizer) {
            console.log(`Worker: Loading tokenizer for model ID: ${this.model_id}`);
            this.tokenizer = await AutoTokenizer.from_pretrained(this.model_id, {
                legacy: true,
                progress_callback,
            });
            console.log(`Worker: Tokenizer loaded for model ID: ${this.model_id}`);
        }

        // Load the model if not already loaded
        if (!this.model) {
            console.log(`Worker: Loading model for model ID: ${this.model_id}`);
            this.model = await AutoModelForCausalLM.from_pretrained(this.model_id, {
                dtype: modelConfig.quantization || 'fp16', // Use quantization if applicable
                device: 'webgpu',
                use_external_data_format: !!modelConfig.quantization, // Use external data if quantized
                progress_callback,
                max_memory: { webgpu: 0.5 * 1024 ** 3 }, // Limit model memory to 512MB
            });
            console.log(`Worker: Model loaded for model ID: ${this.model_id}`);
        }

        return [this.tokenizer, this.model];
    }
}

async function generate(messages) {
    try {
        const [tokenizer, model] = await TextGenerationPipeline.getInstance(TextGenerationPipeline.model_id);

        console.log("Worker: Messages sent to model:", messages);

        const inputs = tokenizer.apply_chat_template(messages, {
            add_generation_prompt: true,
            return_dict: true,
        });

        let startTime;
        let numTokens = 0;

        const cb = (output) => {
            startTime ??= performance.now();
            let tps;
            if (numTokens++ > 0) {
                tps = numTokens / (performance.now() - startTime) * 1000;
            }
            self.postMessage({
                status: 'update',
                output, tps, numTokens,
                model_id: TextGenerationPipeline.model_id,
            });
        }

        const streamer = new CallbackTextStreamer(tokenizer, cb);

        self.postMessage({ status: 'start', model_id: TextGenerationPipeline.model_id });

        const outputs = await model.generate({
            ...inputs,
            max_new_tokens: 128, // Limit the token generation to reduce memory load
            streamer,
            stopping_criteria,
        });

        // Check if interrupted during generation
        if (stopping_criteria.interrupted) {
            console.log('Generation interrupted, stopping early.');
            self.postMessage({
                status: 'interrupted',
                model_id: TextGenerationPipeline.model_id,
            });
            return;
        }

        const outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: false });

        self.postMessage({
            status: 'complete',
            output: outputText,
            model_id: TextGenerationPipeline.model_id,
        });
    } catch (error) {
        console.error('Worker: Error during text generation:', error);
        self.postMessage({ status: 'error', message: `Failed to generate text: ${error.message}`, model_id: TextGenerationPipeline.model_id });
    }
}

async function load(model_id) {
    const modelConfig = modelsConfig.find(m => m.model_id === model_id);
    if (!modelConfig) {
        self.postMessage({ status: 'error', message: `Model ID "${model_id}" not found.`, model_id: null });
        return;
    }

    TextGenerationPipeline.model_id = model_id;

    console.log(`Worker: Loading model with ID: ${model_id}`);

    self.postMessage({
        status: 'loading',
        data: `Loading model "${model_id}"...`,
        model_id
    });

    try {
        const [tokenizer, model] = await TextGenerationPipeline.getInstance(model_id, x => {
            self.postMessage({ ...x, model_id });
        });

        console.log(`Worker: Compiling shaders and warming up model: ${model_id}`);

        self.postMessage({
            status: 'loading',
            data: 'Compiling shaders and warming up model...',
            model_id
        });

        const inputs = tokenizer('a');
        await model.generate({ ...inputs, max_new_tokens: 1 });

        console.log(`Worker: Model "${model_id}" is ready.`);

        self.postMessage({ status: 'ready', model_id });
    } catch (error) {
        console.error(`Worker: Error during model loading: ${error}`);
        self.postMessage({ status: 'error', message: `Failed to load model: ${error.message}`, model_id });
    }
}

// Event listener to handle messages from the main thread
self.addEventListener('message', async (e) => {
    if (!e.data || typeof e.data !== 'object') {
        console.error('Worker: Received invalid message format:', e.data);
        self.postMessage({ status: 'error', message: 'Invalid message format received.', model_id: null });
        return;
    }

    const { type, data } = e.data;

    console.log(`Worker: Received message of type "${type}" with data:`, data);

    if (!type) {
        console.error('Worker: Message type is missing.');
        self.postMessage({ status: 'error', message: 'Message type is missing.', model_id: null });
        return;
    }

    switch (type) {
        case 'load':
            if (!data || !data.model_id) {
                console.error('Worker: model_id is missing in load message.');
                self.postMessage({ status: 'error', message: 'model_id is missing in load message.', model_id: null });
                break;
            }
            load(data.model_id);
            break;

        case 'generate':
            stopping_criteria.reset(); // Reset stopping criteria before generating
            generate(data);
            break;

        case 'interrupt':
            stopping_criteria.interrupt(); // Interrupt the ongoing text generation
            console.log('Worker: Interrupt received, stopping generation.');
            break;

        case 'reset':
            stopping_criteria.reset(); // Reset stopping criteria
            console.log('Worker: Resetting stopping criteria.');
            break;

        default:
            console.error(`Worker: Unknown message type: "${type}"`);
            self.postMessage({ status: 'error', message: `Unknown message type: "${type}"`, model_id: TextGenerationPipeline.model_id });
    }
});
