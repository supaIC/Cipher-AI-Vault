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

class TextGenerationPipeline {
    static model_id = null;
    static model = null;
    static tokenizer = null;

    static async getInstance(progress_callback = null) {
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
    const [tokenizer, model] = await TextGenerationPipeline.getInstance();

    console.log("Messages sent to model:", messages); // Debugging log

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

    self.postMessage({ status: 'start' });

    const outputs = await model.generate({
        ...inputs,
        max_new_tokens: 512,
        streamer,
        stopping_criteria,
    });
    const outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: false });

    self.postMessage({
        status: 'complete',
        output: outputText,
    });
}

async function performSearch(query) {
    // Perform a search in the knowledge graph
    const response = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.results;
}

async function load() {
    self.postMessage({
        status: 'loading',
        data: 'Loading model...'
    });

    const [tokenizer, model] = await TextGenerationPipeline.getInstance(x => {
        self.postMessage(x);
    });

    self.postMessage({
        status: 'loading',
        data: 'Compiling shaders and warming up model...'
    });

    const inputs = tokenizer('a');
    await model.generate({ ...inputs, max_new_tokens: 1 });
    self.postMessage({ status: 'ready' });
}

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
