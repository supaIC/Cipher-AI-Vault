export const modelsConfig = [
  {
    key: 'phi-3-mini-4k-instruct',
    name: 'Phi 3 Mini 4k Instruct',
    model_id: 'Xenova/Phi-3-mini-4k-instruct',
    backend: 'transformers',
    quantization: 'q4', // Quantized for WebGPU
    description: 'A standard Phi model optimized for WebGPU.',
  },
  {
    key: 'llama-3.2-1b-instruct',
    name: 'Llama 3.2 1B Instruct (ONNX)',
    model_id: 'onnx-community/Llama-3.2-1B-Instruct-q4f16',
    backend: 'onnx',
    quantization: 'q4f16', // Use quantized version to reduce memory footprint
    description: 'An ONNX-compatible Llama model for efficient inference.',
  },
  {
    key: 'llama-3.2-3b-instruct',
    name: 'Llama 3.2 3B Instruct (ONNX)',
    model_id: 'onnx-community/Llama-3.2-3B-Instruct',
    backend: 'onnx',
    quantization: 'q4', // Use quantized version to reduce memory footprint
    description: 'An ONNX-compatible Llama model for efficient inference.',
  },
];
