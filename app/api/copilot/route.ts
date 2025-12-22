import { NextRequest, NextResponse } from 'next/server';
import { streamChat, generateText } from '@/lib/copilot/gemini';
import { getSystemContext, getDocSelectionPrompt, parseSelectedDocs, getQuickContext } from '@/lib/copilot/context';
import { getDocumentIndex } from '@/lib/copilot/index';

export async function POST(req: NextRequest) {
    try {
        const { messages, currentPage } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Get the latest user message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== 'user') {
            return NextResponse.json(
                { error: 'Last message must be from user' },
                { status: 400 }
            );
        }

        const userQuestion = lastMessage.content;

        // Format history for Gemini
        // Gemini requires the first message in history to be from 'user'
        let historyMessages = messages.slice(0, -1);

        // If the first message is from assistant (e.g. welcome message), remove it
        if (historyMessages.length > 0 && historyMessages[0].role === 'assistant') {
            historyMessages = historyMessages.slice(1);
        }

        const history = historyMessages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            content: msg.content,
        }));

        // Check if we have any indexed documents
        const docIndex = getDocumentIndex();
        let systemContext: string;

        if (docIndex.length > 0) {
            // TWO-PASS RETRIEVAL
            // Pass 1: Ask AI to select relevant documents
            console.log('[copilot] Pass 1: Selecting relevant documents...');
            const selectionPrompt = getDocSelectionPrompt(userQuestion);
            const selectionResponse = await generateText(selectionPrompt);
            const selectedDocs = parseSelectedDocs(selectionResponse);
            console.log(`[copilot] Selected ${selectedDocs.length} docs:`, selectedDocs);

            // Pass 2: Get context with only selected docs
            systemContext = await getSystemContext(selectedDocs, currentPage);
        } else {
            // No docs indexed, use quick context
            console.log('[copilot] No docs indexed, using quick context');
            systemContext = await getQuickContext(currentPage);
        }

        // Stream the response
        const stream = await streamChat(history, userQuestion, systemContext);

        // Convert Gemini stream to web stream
        const readableStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of stream) {
                        const text = chunk.text();
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (error: any) {
                    console.error('[copilot] Stream error:', error);
                    controller.error(error);
                }
            },
        });

        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });

    } catch (error: any) {
        console.error('Copilot API Error:', error);

        // Handle rate limit errors (429)
        if (error.message?.includes('429') || error.status === 429) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    code: 'RATE_LIMIT',
                    message: 'The AI service is temporarily busy. Please wait a moment and try again.'
                },
                { status: 429 }
            );
        }

        // Handle quota exceeded
        if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            return NextResponse.json(
                {
                    error: 'Quota exceeded',
                    code: 'QUOTA_EXCEEDED',
                    message: 'The AI service has reached its usage limit. Please try again later.'
                },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
