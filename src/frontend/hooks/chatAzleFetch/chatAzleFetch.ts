// This should become its own backend canister service that can be called from the frontend

import { ic, query, Server } from 'azle';
import { HttpTransformArgs, HttpResponse } from 'azle/canisters/management';
import express from 'express';

const OPENAI_API_KEY = 'add-openai-key-here'; // Replace with your OpenAI API key
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const chatAzleFetch = Server(
  () => {
    const app = express();

    app.use(express.json());

    app.post('/chat', async (req, res) => {
      const { prompt, model, max_tokens, temperature } = req.body;

      try {
        const response = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens,
            temperature,
          }),
        });

        // Check if request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse JSON response
        const responseJson = await response.json();

        // Send the JSON response from OpenAI directly to the client
        res.json(responseJson);
      } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
      }
    });

    return app.listen();
  },
  {
    transform: query(
      [HttpTransformArgs],
      HttpResponse,
      (httpTransformArgs) => {
        return {
          ...httpTransformArgs.response,
          headers: [],
          body: httpTransformArgs.context,
        };
      }
    ),
  }
);

export default chatAzleFetch;
