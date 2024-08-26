// import {
//     AutoTokenizer,
//     AutoModelForCausalLM,
//     TextStreamer,
//     StoppingCriteria,
//     env,
// } from '@huggingface/transformers';

// // Define local model path
// const LOCAL_MODEL_PATH = '/models/Phi-3-mini-4k-instruct_fp16';
// const ONNX_MODEL_PATH = `${LOCAL_MODEL_PATH}/onnx`;

// // Set environment variables
// env.localModelPath = LOCAL_MODEL_PATH;
// env.allowRemoteModels = false;
// env.allowLocalModels = true;

// class CallbackTextStreamer extends TextStreamer {
//     constructor(tokenizer, cb) {
//         super(tokenizer, {
//             skip_prompt: true,
//             skip_special_tokens: true,
//         });
//         this.cb = cb;
//     }

//     on_finalized_text(text) {
//         this.cb(text);
//     }
// }

// class InterruptableStoppingCriteria extends StoppingCriteria {
//     constructor() {
//         super();
//         this.interrupted = false;
//     }

//     interrupt() {
//         this.interrupted = true;
//     }

//     reset() {
//         this.interrupted = false;
//     }

//     _call(input_ids, scores) {
//         return new Array(input_ids.length).fill(this.interrupted);
//     }
// }

// const stopping_criteria = new InterruptableStoppingCriteria();

// // Helper function to fetch and parse JSON safely
// async function fetchAndParseJSON(url) {
//     const response = await fetch(url);
//     if (!response.ok) {
//         throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
//     }
//     const contentType = response.headers.get('content-type');
//     if (!contentType || !contentType.includes('application/json')) {
//         throw new Error(`Expected JSON but got ${contentType} for ${url}`);
//     }
//     return await response.json();
// }

// class TextGenerationPipeline {
//     static model_id = ONNX_MODEL_PATH;
//     static model = null;
//     static tokenizer = null;
//     static streamer = null;

//     static async getInstance(progress_callback = null) {
//         const modelPath = this.model_id;

//         console.log(`Loading ONNX model from: ${modelPath}/model_q4.onnx`);
//         console.log(`Loading ONNX model data from: ${modelPath}/model_q4.onnx_data`);

//         try {
//             const configUrl = `${LOCAL_MODEL_PATH}/config.json`;
//             const tokenizerUrl = `${LOCAL_MODEL_PATH}/tokenizer.json`;
//             const tokenizerConfigUrl = `${LOCAL_MODEL_PATH}/tokenizer_config.json`;
//             const specialTokensMapUrl = `${LOCAL_MODEL_PATH}/special_tokens_map.json`;

//             const config = await fetchAndParseJSON(configUrl);
//             const tokenizerJson = await fetchAndParseJSON(tokenizerUrl);
//             const tokenizerConfig = await fetchAndParseJSON(tokenizerConfigUrl);
//             const specialTokensMap = await fetchAndParseJSON(specialTokensMapUrl);

//             this.tokenizer ??= AutoTokenizer.from_pretrained(LOCAL_MODEL_PATH, {
//                 config,
//                 tokenizer: tokenizerJson,
//                 tokenizer_config: tokenizerConfig,
//                 special_tokens_map: specialTokensMap,
//                 progress_callback,
//             });
//             console.log('Tokenizer loaded successfully');
//         } catch (error) {
//             console.error('Error loading tokenizer:', error);
//         }

//         try {
//             this.model ??= AutoModelForCausalLM.from_pretrained(modelPath, {
//                 model_file: `${modelPath}/model_q4.onnx`,
//                 model_data_file: `${modelPath}/model_q4.onnx_data`,
//                 dtype: 'q4',
//                 device: 'webgpu',
//                 use_external_data_format: true,
//                 progress_callback,
//             });
//             console.log('Model loaded successfully');
//         } catch (error) {
//             console.error('Error loading model:', error);
//         }

//         return Promise.all([this.tokenizer, this.model]);
//     }
// }

// async function generate(messages) {
//     const [tokenizer, model] = await TextGenerationPipeline.getInstance();

//     const inputs = tokenizer.apply_chat_template(messages, {
//         add_generation_prompt: true,
//         return_dict: true,
//     });

//     let startTime;
//     let numTokens = 0;
//     const cb = (output) => {
//         startTime ??= performance.now();

//         let tps;
//         if (numTokens++ > 0) {
//             tps = numTokens / (performance.now() - startTime) * 1000;
//         }
//         self.postMessage({
//             status: 'update',
//             output,
//             tps,
//             numTokens,
//         });
//     };

//     const streamer = new CallbackTextStreamer(tokenizer, cb);

//     self.postMessage({ status: 'start' });

//     const outputs = await model.generate({
//         ...inputs,
//         max_new_tokens: 512,
//         streamer,
//         stopping_criteria,
//     });
//     const outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: false });

//     self.postMessage({
//         status: 'complete',
//         output: outputText,
//     });
// }

// async function load() {
//     self.postMessage({
//         status: 'loading',
//         data: 'Loading model...',
//     });

//     const [tokenizer, model] = await TextGenerationPipeline.getInstance((x) => {
//         self.postMessage(x);
//     });

//     self.postMessage({
//         status: 'loading',
//         data: 'Compiling shaders and warming up model...',
//     });

//     const inputs = tokenizer('a');
//     await model.generate({ ...inputs, max_new_tokens: 1 });
//     self.postMessage({ status: 'ready' });
// }

// self.addEventListener('message', async (e) => {
//     const { type, data } = e.data;

//     switch (type) {
//         case 'load':
//             load();
//             break;

//         case 'generate':
//             stopping_criteria.reset();
//             generate(data);
//             break;

//         case 'interrupt':
//             stopping_criteria.interrupt();
//             break;

//         case 'reset':
//             stopping_criteria.reset();
//             break;
//     }
// });


// import * as ort from 'onnxruntime-web';

// class InterruptableStoppingCriteria {
//     constructor() {
//         this.interrupted = false;
//     }

//     interrupt() {
//         this.interrupted = true;
//     }

//     reset() {
//         this.interrupted = false;
//     }

//     shouldStop() {
//         return this.interrupted;
//     }
// }

// const stopping_criteria = new InterruptableStoppingCriteria();

// class ONNXTextGeneration {
//     constructor(modelPath, progressCallback) {
//         this.modelPath = modelPath;
//         this.progressCallback = progressCallback;
//         this.session = null;
//     }

//     async loadModel() {
//         this.progressCallback({ status: 'loading', message: 'Loading ONNX model...' });
//         this.session = await ort.InferenceSession.create(`${this.modelPath}/onnx/model_q4.onnx`, {
//             executionProviders: ['webgpu', 'wasm'],
//         });
//         this.progressCallback({ status: 'loading', message: 'Model loaded successfully.' });
//     }

//     async generate(inputIds, maxNewTokens = 512) {
//         if (!this.session) {
//             throw new Error('Model not loaded.');
//         }

//         const feeds = { input_ids: inputIds };
//         const outputs = [];

//         for (let i = 0; i < maxNewTokens; i++) {
//             if (stopping_criteria.shouldStop()) break;

//             const result = await this.session.run(feeds);
//             const nextToken = result.logits.data[result.logits.data.length - 1];

//             outputs.push(nextToken);
//             feeds.input_ids = new ort.Tensor('int32', new Int32Array([...inputIds, nextToken]), [1, inputIds.length + 1]);

//             this.progressCallback({
//                 status: 'update',
//                 output: nextToken,
//                 tokenIndex: i,
//             });
//         }

//         return outputs;
//     }
// }

// async function loadAndGenerate() {
//     const progressCallback = (data) => {
//         console.log(data.message || `Progress: ${data.tokenIndex} tokens generated.`);
//     };

//     const modelPath = 'dist/models/Phi-3-mini-4k-instruct_fp16';
//     const onnxGenerator = new ONNXTextGeneration(modelPath, progressCallback);

//     await onnxGenerator.loadModel();

//     const inputIds = [0]; // Example input IDs. Replace with actual input preprocessing logic.
//     const outputs = await onnxGenerator.generate(inputIds);

//     console.log('Generated outputs:', outputs);
// }

// self.addEventListener('message', async (e) => {
//     const { type, data } = e.data;

//     switch (type) {
//         case 'load':
//             await loadAndGenerate();
//             break;

//         case 'interrupt':
//             stopping_criteria.interrupt();
//             break;

//         case 'reset':
//             stopping_criteria.reset();
//             break;
//     }
// });






import {
    AutoTokenizer,
    AutoModelForCausalLM,
    TextStreamer,
    StoppingCriteria,
} from '@huggingface/transformers';


class CallbackTextStreamer extends TextStreamer {
    constructor(tokenizer, cb) {
        super(tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
        });
        this.cb = cb;
    }

    on_finalized_text(text) {
        this.cb(text);
    }
}

class InterruptableStoppingCriteria extends StoppingCriteria {
    constructor() {
        super();
        this.interrupted = false;
    }

    interrupt() {
        this.interrupted = true;
    }

    reset() {
        this.interrupted = false;
    }

    _call(input_ids, scores) {
        return new Array(input_ids.length).fill(this.interrupted);
    }
}

const stopping_criteria = new InterruptableStoppingCriteria();

async function hasFp16() {
    try {
        const adapter = await navigator.gpu.requestAdapter();
        return adapter.features.has('shader-f16');
    } catch (e) {
        return false;
    }
}

/**
 * This class uses the Singleton pattern to ensure that only one instance of the model is loaded.
 */
class TextGenerationPipeline {
    static model_id = null;
    static model = null;
    static tokenizer = null;
    static streamer = null;

    static async getInstance(progress_callback = null) {
        // Choose the model based on whether fp16 is available
        this.model_id ??= (await hasFp16())
            ? 'Xenova/Phi-3-mini-4k-instruct_fp16'
            : 'Xenova/Phi-3-mini-4k-instruct';

        this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, {
            legacy: true,
            progress_callback,
        });

        this.model ??= AutoModelForCausalLM.from_pretrained(this.model_id, {
            dtype: 'q4',
            device: 'webgpu',
            use_external_data_format: true,
            progress_callback,
        });

        return Promise.all([this.tokenizer, this.model]);
    }
}

async function generate(messages) {
    // Retrieve the text-generation pipeline.
    const [tokenizer, model] = await TextGenerationPipeline.getInstance();

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
        });
    }

    const streamer = new CallbackTextStreamer(tokenizer, cb);

    // Tell the main thread we are starting
    self.postMessage({ status: 'start' });

    const outputs = await model.generate({
        ...inputs,
        max_new_tokens: 512,
        streamer,
        stopping_criteria,
    });
    const outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: false });

    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: outputText,
    });
}

async function load() {
    self.postMessage({
        status: 'loading',
        data: 'Loading model...'
    });

    // Load the pipeline and save it for future use.
    const [tokenizer, model] = await TextGenerationPipeline.getInstance(x => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
    });

    self.postMessage({
        status: 'loading',
        data: 'Compiling shaders and warming up model...'
    });

    // Run model with dummy input to compile shaders
    const inputs = tokenizer('a');
    await model.generate({ ...inputs, max_new_tokens: 1 });
    self.postMessage({ status: 'ready' });
}
// Listen for messages from the main thread
self.addEventListener('message', async (e) => {
    const { type, data } = e.data;

    switch (type) {
        case 'load':
            load();
            break;

        case 'generate':
            stopping_criteria.reset();
            generate(data);
            break;

        case 'interrupt':
            stopping_criteria.interrupt();
            break;

        case 'reset':
            stopping_criteria.reset();
            break;
    }
});