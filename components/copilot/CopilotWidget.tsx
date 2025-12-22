'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, X, Send, Loader2, Search, Database, Wand2 } from 'lucide-react';
import { CopilotMessage, Message } from './CopilotMessage';
import { cn } from '@/lib/utils';

type LoadingPhase = 'searching' | 'fetching' | 'generating' | null;

const loadingMessages: Record<string, { icon: React.ReactNode; text: string }> = {
    searching: { icon: <Search className="h-3.5 w-3.5" />, text: 'Searching Xandeum docs...' },
    fetching: { icon: <Database className="h-3.5 w-3.5" />, text: 'Fetching live data...' },
    generating: { icon: <Wand2 className="h-3.5 w-3.5" />, text: 'Generating response...' },
};

export function CopilotWidget() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hey! 👋 I'm your Xandeum assistant. Ask me anything about the network, nodes, XAND token, or how to use this dashboard.",
            timestamp: Date.now(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Listen for external trigger events (e.g., from Compare page)
    useEffect(() => {
        const handleTrigger = (event: CustomEvent<{ message: string }>) => {
            const message = event.detail?.message;
            if (message) {
                setIsOpen(true);
                // Delay slightly to allow widget to open first
                setTimeout(() => {
                    setInput(message);
                    // Auto-send after a brief moment
                    setTimeout(() => {
                        sendMessage(message, messages);
                    }, 100);
                }, 200);
            }
        };

        window.addEventListener('copilot:trigger', handleTrigger as EventListener);
        return () => window.removeEventListener('copilot:trigger', handleTrigger as EventListener);
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, loadingPhase]);

    // Simulate loading phase progression
    useEffect(() => {
        if (!isLoading) {
            setLoadingPhase(null);
            return;
        }

        // Start with searching
        setLoadingPhase('searching');

        const timer1 = setTimeout(() => {
            if (isLoading) setLoadingPhase('fetching');
        }, 800);

        const timer2 = setTimeout(() => {
            if (isLoading) setLoadingPhase('generating');
        }, 1500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [isLoading]);

    const sendMessage = async (content: string, messagesHistory: Message[]) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
        };

        const newMessages = [...messagesHistory, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    currentPage: pathname,
                }),
            });

            if (!response.ok) {
                // Handle rate limit and quota errors with graceful messages
                if (response.status === 429) {
                    const errorData = await response.json();
                    let errorMessage = "⏳ I'm a bit overwhelmed right now. Please wait a moment and try again.";

                    if (errorData.code === 'QUOTA_EXCEEDED') {
                        errorMessage = "🔋 I've reached my daily limit. I'll be back to full power soon! Please try again in a few hours.";
                    } else if (errorData.code === 'RATE_LIMIT') {
                        errorMessage = "⏳ Too many requests! Take a breath and try again in a few seconds.";
                    }

                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: errorMessage,
                        timestamp: Date.now(),
                    }]);
                    setIsLoading(false);
                    return;
                }
                throw new Error('Failed to fetch response');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const assistantMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
            }]);

            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                accumulatedContent += text;

                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                ));
            }
        } catch (error) {
            console.error('Copilot error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "😅 Oops, something went wrong. Let me catch my breath and try again!",
                timestamp: Date.now(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;
        await sendMessage(input, messages);
    };

    const handleRegenerate = async () => {
        // Find the last user message and regenerate from there
        const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
        if (lastUserIndex === -1) return;

        const actualIndex = messages.length - 1 - lastUserIndex;
        const lastUserMessage = messages[actualIndex];

        // Remove the last assistant message and regenerate
        const historyUpToUser = messages.slice(0, actualIndex);
        await sendMessage(lastUserMessage.content, historyUpToUser);
    };

    const handleEdit = async (messageId: string, newContent: string) => {
        // Find the message index
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;

        // Truncate conversation to this point (excluding this message)
        const historyBeforeEdit = messages.slice(0, messageIndex);

        // Send the edited message
        await sendMessage(newContent, historyBeforeEdit);
    };

    const handleCopy = (content: string) => {
        // Optional: show a toast or feedback
    };

    const currentLoadingMessage = loadingPhase ? loadingMessages[loadingPhase] : null;

    return (
        <>
            {/* Chat Window - Separate from toggle button for proper mobile fullscreen */}
            <div className={cn(
                "fixed z-50 transition-all duration-300 ease-in-out",
                isOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none",
                // Mobile: full screen
                "inset-0",
                // Desktop: positioned bottom-right with specific size
                "sm:inset-auto sm:bottom-6 sm:right-6"
            )}>
                <Card className={cn(
                    "shadow-xl border-primary/20 flex flex-col transition-transform duration-300",
                    isOpen ? "scale-100" : "scale-95",
                    // Mobile: full screen
                    "w-full h-full rounded-none",
                    // Desktop: fixed size
                    "sm:w-[380px] sm:h-[550px] sm:rounded-xl"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Copilot
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <div
                            ref={scrollRef}
                            className="absolute inset-0 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth"
                        >
                            {messages.map((msg, index) => (
                                <CopilotMessage
                                    key={msg.id}
                                    message={msg}
                                    isLast={index === messages.length - 1 && msg.role === 'assistant'}
                                    onCopy={handleCopy}
                                    onRegenerate={handleRegenerate}
                                    onEdit={handleEdit}
                                    showActions={!isLoading}
                                />
                            ))}
                            {isLoading && currentLoadingMessage && (
                                <div className="flex w-full gap-3 flex-row">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted shadow-sm">
                                        <BotIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs bg-muted/50 border border-border rounded-xl px-3 py-2">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span className="flex items-center gap-1.5">
                                            {currentLoadingMessage.icon}
                                            {currentLoadingMessage.text}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-muted/20">
                        <form onSubmit={handleSubmit} className="flex w-full gap-2 items-end">
                            <Textarea
                                ref={inputRef}
                                placeholder="Ask about Xandeum... (Shift+Enter to send)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.shiftKey && !isLoading && input.trim()) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                disabled={isLoading}
                                className="flex-1 text-sm min-h-[40px] max-h-[120px]"
                                rows={1}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>

            {/* Toggle Button - Fixed position, hidden when chat is open */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="fixed bottom-12 right-4 sm:bottom-12 sm:right-6 z-50"
                        data-tour="copilot-button"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            <Button
                                onClick={() => setIsOpen(true)}
                                size="lg"
                                className="h-14 w-14 rounded-full shadow-lg"
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <Sparkles className="h-6 w-6" />
                                </motion.div>
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    )
}
