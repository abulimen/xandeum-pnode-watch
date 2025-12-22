import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('Missing GEMINI_API_KEY environment variable');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Use model from env or default to latest flash model
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export async function streamChat(
    history: { role: string; content: string }[],
    newMessage: string,
    systemInstruction?: string
) {
    if (!genAI) {
        throw new Error('Gemini API not configured');
    }

    const model = genAI.getGenerativeModel({ model: modelName });

    // Convert to Gemini format
    const geminiHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
        history: geminiHistory,
        systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
    });

    const result = await chat.sendMessageStream(newMessage);
    return result.stream;
}

// Non-streaming text generation for document selection
export async function generateText(prompt: string): Promise<string> {
    if (!genAI) {
        throw new Error('Gemini API not configured');
    }

    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
}
