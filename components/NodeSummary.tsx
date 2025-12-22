'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface NodeSummaryData {
    generatedAt: string;
    title: string;
    content: string;
    recommendation: string;
}

interface NodeSummaryProps {
    node: any;
    networkStats?: {
        avgUptime?: number;
        avgHealth?: number;
        totalNodes?: number;
        creditsThreshold?: number;
    };
}

export function NodeSummary({ node, networkStats }: NodeSummaryProps) {
    const [summary, setSummary] = useState<NodeSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [displayedContent, setDisplayedContent] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Cache key per node
    const CACHE_KEY = `xandeum_node_summary_${node?.id}`;
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

    useEffect(() => {
        if (node?.id) {
            loadSummary();
        }
    }, [node?.id]);

    // Typewriter effect
    useEffect(() => {
        if (!summary?.content || !isTyping) return;

        let currentIndex = 0;
        const text = summary.content;
        setDisplayedContent('');

        const intervalId = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedContent(prev => prev + text.charAt(currentIndex));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(intervalId);
            }
        }, 12);

        return () => clearInterval(intervalId);
    }, [summary, isTyping]);

    const loadSummary = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        setDisplayedContent('');

        // Check cache first
        if (!forceRefresh) {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TTL) {
                        setSummary(data);
                        setDisplayedContent(data.content);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                // Ignore cache errors
            }
        }

        try {
            const response = await fetch('/api/node-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ node, networkStats })
            });

            if (!response.ok) throw new Error('Failed to generate summary');

            const data = await response.json();
            setSummary(data);
            setIsTyping(true);

            // Cache the result
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
            } catch (e) {
                // Ignore cache errors
            }
        } catch (err) {
            setError('Failed to generate summary');
            console.error('[NodeSummary] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <Card className="overflow-hidden w-full">
                <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => loadSummary(true)}>
                        <RefreshCw className="h-3 w-3 mr-2" /> Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
            <Card className="overflow-hidden w-full">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                        >
                            <Sparkles className="h-4 w-4 text-primary" />
                        </motion.div>
                        Node Summary
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => loadSummary(true)}
                        disabled={loading}
                        className="h-7 w-7"
                    >
                        {/* <RefreshCw className={cn("h-3.5 w-3.5 text-muted-foreground", loading && "animate-spin")} /> */}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading && !summary ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-5/6"></div>
                            <div className="h-4 bg-muted rounded w-4/5"></div>
                        </div>
                    ) : summary ? (
                        <div className="space-y-3 animate-in fade-in duration-500">
                            <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        strong: ({ node, ...props }) => <span className="font-semibold text-primary" {...props} />
                                    }}
                                >
                                    {isTyping ? displayedContent : summary.content}
                                </ReactMarkdown>
                            </div>

                            {(!isTyping || displayedContent.length > summary.content.length * 0.8) && (
                                <div className="pt-2 border-t border-border/50 animate-in slide-in-from-bottom-2 duration-500">
                                    <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" /> Recommendation
                                    </p>
                                    <p className="text-xs text-muted-foreground italic">
                                        {summary.recommendation}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </motion.div>
    );
}
