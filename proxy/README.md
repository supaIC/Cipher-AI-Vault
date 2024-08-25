# OpenAI proxy for IPv6

A proxy, deployed as Firebase functions, used to relay queries to the OpenAI API via IPv6 due to their IPv4 limitations.

- Proxy is currently running on: https://us-central1-openai-proxy-ea66c.cloudfunctions.net/openai

To deploy the proxy:

- Must have pay as you go Firebase account
- must enable needed apis (will happen automatically when deploying)
- must set OpenAI API key using: ```firebase functions:config:set openai.key="..."```
- Must enable Firebase Store in Firebase console

Useful commands:

- ```firebase functions:config:set openai.key="..."```   // Set OpenAI API key

- ```firebase functions:config:get```                    // Get config values

- ``` curl -X POST https://us-central1-openai-proxy-ea66c.cloudfunctions.net/openai/images/generations -H "Content-Type: application/json" -H "idempotency-key: 1235" -d '{"prompt": "A futuristic cityscape"}'``` // Test proxy for OpenAI API image generation

- `curl -X POST https://us-central1-openai-proxy-ea66c.cloudfunctions.net/openai/chat/completions \
-H "Content-Type: application/json" \
-H "idempotency-key: your-unique-idempotency-key" \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [{"role": "user", "content": "Tell me a joke."}],
  "max_tokens": 1024,
  "temperature": 0.7
}'` // Test proxy for OpenAI API chat completion

- OpenAI Key: ```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```