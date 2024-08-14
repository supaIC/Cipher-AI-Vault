import { ic, query, Server } from 'azle';
import { HttpTransformArgs, HttpResponse } from 'azle/canisters/management';
import express from 'express';

const OPENAI_API_KEY = 'sk-proj-GSqQr81iwkaLSaH6cwveT3BlbkFJmIM2GEGiZW6Cfmd83iTO';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export default Server(
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