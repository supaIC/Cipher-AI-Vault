import { ic, query, Server } from 'azle';
import { HttpTransformArgs, HttpResponse } from 'azle/canisters/management';
import express from 'express';

const ANTHROPIC_API_KEY = 'your-key-API-here'; // Your Anthropic API key here
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'; // Correct endpoint

export default Server(
    () => {
        const app = express();

        app.use(express.json());

        app.post('/chat', async (req, res) => {
            const { messages, max_tokens } = req.body;

            try {
                const response = await fetch(ANTHROPIC_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': ANTHROPIC_API_KEY, // API key for authentication
                        'anthropic-version': '2023-06-01' // Required header for Anthropic API
                    },
                    body: JSON.stringify({
                        model: 'claude-3-5-sonnet-20240620', // Hardcoded model
                        messages: messages || [], // Ensure messages is an array
                        max_tokens: max_tokens || 1024, // Default value if not provided
                    }),
                });

                const responseJson = await response.json();
                res.json(responseJson);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'An error occurred while processing the request.' });
            }
        });

        app.use(express.static('/dist'));

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
