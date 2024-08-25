import { ic, query, Server } from 'azle';
import { HttpTransformArgs, HttpResponse } from 'azle/canisters/management';
import express from 'express';

const PROXY_URL = 'https://us-central1-openai-proxy-ea66c.cloudfunctions.net/openai/chat/completions';

export default Server(
    () => {
        const app = express();

        app.use(express.json());

        app.post('/chat', async (req, res) => {
            const { prompt, model, max_tokens, temperature } = req.body;
        
            try {
                ic.setOutgoingHttpOptions({
                    cycles: 30000000000n
                });

                const response = await fetch(PROXY_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'idempotency-key': req.get('idempotency-key') || 'default-key',
                    },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens,
                        temperature,
                    }),
                });
                console.log(response);
        
                if (!response.ok) {
                    // Log the status code, status text, and response body
                    const errorText = await response.text();
                    console.error('OpenAI API error:', response.status, response.statusText, errorText);
                    res.status(response.status).json({ error: 'OpenAI API error', details: errorText });
                    return;
                }
        
                const responseJson = await response.json();
                console.log('OpenAI API response JSON:', responseJson);
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