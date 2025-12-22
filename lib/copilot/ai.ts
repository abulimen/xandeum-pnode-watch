
const LONGCAT_API_KEY = process.env.LONGCAT_API_KEY;
const LONGCAT_API_URL = process.env.LONGCAT_API_URL || 'https://api.longcat.chat/openai/v1/chat/completions';
const MODEL_NAME = 'LongCat-Flash-Chat';

if (!LONGCAT_API_KEY) {
    console.warn('Missing LONGCAT_API_KEY environment variable');
}

export async function* streamChat(history: { role: string; content: string }[], newMessage: string, systemInstruction?: string) {
    const messages = [];

    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }

    // Add history
    messages.push(...history);

    // Add new message
    messages.push({ role: 'user', content: newMessage });

    const response = await fetch(LONGCAT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LONGCAT_API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: messages,
            stream: true,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`LongCat API Error: ${response.status} ${error}`);
    }

    if (!response.body) {
        throw new Error('No response body from LongCat API');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    console.log('[AI] Starting stream read...');

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            console.log('[AI] Stream done');
            break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log(`[AI] Received chunk: ${chunk.length} bytes`);
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            let data = trimmed.slice(5); // Remove 'data:'
            if (data.startsWith(' ')) data = data.slice(1); // Remove optional space

            if (data === '[DONE]') {
                console.log('[AI] Received [DONE]');
                return;
            }

            try {
                const json = JSON.parse(data);
                const content = json.choices[0]?.delta?.content;
                if (content) {
                    // console.log(`[AI] Yielding content: "${content.substring(0, 20)}..."`);
                    yield content;
                }
            } catch (e) {
                console.error('Error parsing SSE data:', e);
                console.error('Bad data:', data);
            }
        }
    }
}

export async function generateText(prompt: string): Promise<string> {
    const response = await fetch(LONGCAT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LONGCAT_API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`LongCat API Error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}
