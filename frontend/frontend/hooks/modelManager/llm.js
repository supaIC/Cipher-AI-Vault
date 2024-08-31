import {
    AutoTokenizer,
    AutoModelForCausalLM,
    TextStreamer,
    StoppingCriteria,
} from '@huggingface/transformers';

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
        return new Array(input_ids.length).fill(this.interrupted);
    }
}

// Instantiate the stopping criteria object
const stopping_criteria = new InterruptableStoppingCriteria();

// Utility function to check if the system supports FP16 (16-bit floating point) precision
async function hasFp16() {
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return adapter.features.has('shader-f16');
    } catch (e) {
        return false; // If there's an error, assume FP16 is not supported
    }
}

// Pipeline class for text generation that handles model and tokenizer loading
class TextGenerationPipeline {
    static model_id = null;  // Static variable to store the model ID
    static model = null;     // Static variable to store the model instance
    static tokenizer = null; // Static variable to store the tokenizer instance

    // Method to initialize or retrieve the pipeline components (model and tokenizer)
    static async getInstance(progress_callback = null) {
        // Determine the model ID based on whether FP16 is supported
        this.model_id ??= (await hasFp16())
            ? 'Xenova/Phi-3-mini-4k-instruct_fp16'
            : 'Xenova/Phi-3-mini-4k-instruct';

        // Load the tokenizer if not already loaded
        this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, {
            legacy: true,
            progress_callback,
        });

        // Load the model if not already loaded
        this.model ??= AutoModelForCausalLM.from_pretrained(this.model_id, {
            dtype: 'q4',                    // Quantized 4-bit precision for efficient inference
            device: 'webgpu',               // Use WebGPU for computation
            use_external_data_format: true, // Use external data format for model loading
            progress_callback,
        });

        // Return both the tokenizer and model after they're ready
        return Promise.all([this.tokenizer, this.model]);
    }
}

// Function to handle text generation based on input messages
async function generate(messages) {
    // Retrieve the tokenizer and model from the pipeline
    const [tokenizer, model] = await TextGenerationPipeline.getInstance();

    console.log("Messages sent to model:", messages); // Debugging log

    // Prepare the input for the model using the tokenizer
    const inputs = tokenizer.apply_chat_template(messages, {
        add_generation_prompt: true,
        return_dict: true,
    });

    // Variables for tracking performance and token count
    let startTime;
    let numTokens = 0;

    // Callback function to handle each chunk of generated output
    const cb = (output) => {
        startTime ??= performance.now();

        let tps; // Tokens per second metric
        if (numTokens++ > 0) {
            tps = numTokens / (performance.now() - startTime) * 1000;
        }
        // Send update message with current output, TPS, and token count
        self.postMessage({
            status: 'update',
            output, tps, numTokens,
        });
    }

    // Create a new streamer with the callback function
    const streamer = new CallbackTextStreamer(tokenizer, cb);

    // Send a start message to indicate generation has begun
    self.postMessage({ status: 'start' });

    // Generate text using the model with the specified stopping criteria and streamer
    const outputs = await model.generate({
        ...inputs,
        max_new_tokens: 512,   // Limit the number of new tokens generated
        streamer,
        stopping_criteria,
    });

    // Decode the generated output back into text
    const outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: false });

    // Send the complete output back to the main thread
    self.postMessage({
        status: 'complete',
        output: outputText,
    });
}

// Function to load and prepare the model and tokenizer
async function load() {
    // Notify that the model loading process has started
    self.postMessage({
        status: 'loading',
        data: 'Loading model...'
    });

    // Load the tokenizer and model with a progress callback
    const [tokenizer, model] = await TextGenerationPipeline.getInstance(x => {
        self.postMessage(x);
    });

    // Notify that the model is compiling shaders and warming up
    self.postMessage({
        status: 'loading',
        data: 'Compiling shaders and warming up model...'
    });

    // Warm up the model by generating a single token
    const inputs = tokenizer('a');
    await model.generate({ ...inputs, max_new_tokens: 1 });

    // Notify that the model is ready for use
    self.postMessage({ status: 'ready' });
}

// Event listener to handle messages from the main thread
self.addEventListener('message', async (e) => {
    const { type, data } = e.data;

    switch (type) {
        case 'load':
            load(); // Handle model loading
            break;

        case 'generate':
            stopping_criteria.reset(); // Reset stopping criteria before generating
            generate(data); // Generate text based on the provided data
            break;

        case 'interrupt':
            stopping_criteria.interrupt(); // Interrupt the ongoing text generation
            break;

        case 'reset':
            stopping_criteria.reset(); // Reset stopping criteria
            break;
    }
});
