import { ic, query, Server } from 'azle';
import { HttpTransformArgs, HttpResponse } from 'azle/canisters/management';
import express from 'express';

const OPENAI_API_KEY = 'sk-3-ZVO9SG_xwamGtqBNnegfZM8OQYMgAZmNfBVf__VkT3BlbkFJPrplldLGMmz94FKjEtyGj5FA-UGDQw3lthSrTIoOUA';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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
                console.error('Error:', error.message, error.stack);
                res.status(500).json({ error: 'An error occurred while processing the request.', details: error.message });
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