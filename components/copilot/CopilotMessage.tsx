'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Bot, User, Copy, Check, ExternalLink, RefreshCw, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface CopilotMessageProps {
    message: Message;
    isLast?: boolean;
    onCopy?: (content: string) => void;
    onRegenerate?: () => void;
    onEdit?: (messageId: string, newContent: string) => void;
    showActions?: boolean;
}

// Custom Code Block with Copy Button
function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
    const [copied, setCopied] = useState(false);
    const language = className?.replace('language-', '') || 'text';
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-3">
            <div className="flex items-center justify-between bg-zinc-800 dark:bg-zinc-900 text-zinc-400 text-xs px-4 py-2 rounded-t-lg border-b border-zinc-700">
                <span className="font-mono">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
            <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-b-lg overflow-x-auto text-sm font-mono">
                <code>{codeString}</code>
            </pre>
        </div>
    );
}

// Inline Code
function InlineCode({ children }: { children: React.ReactNode }) {
    return (
        <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
        </code>
    );
}

// Custom Link
function CustomLink({ href, children }: { href?: string; children: React.ReactNode }) {
    const isExternal = href?.startsWith('http');
    return (
        <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-primary hover:text-primary/80 underline underline-offset-2 inline-flex items-center gap-1"
        >
            {children}
            {isExternal && <ExternalLink className="h-3 w-3" />}
        </a>
    );
}

// Custom components for ReactMarkdown
const markdownComponents = {
    code: ({ inline, className, children, ...props }: any) => {
        if (inline) {
            return <InlineCode>{children}</InlineCode>;
        }
        return <CodeBlock className={className}>{children}</CodeBlock>;
    },
    a: ({ href, children }: any) => <CustomLink href={href}>{children}</CustomLink>,
    p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
    li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }: any) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-sm font-bold mb-2 mt-2 first:mt-0">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-3 border-primary/50 pl-3 italic text-muted-foreground my-2 text-sm">
            {children}
        </blockquote>
    ),
    table: ({ children }: any) => (
        <div className="overflow-x-auto my-2">
            <table className="min-w-full border border-border rounded-lg overflow-hidden text-sm">
                {children}
            </table>
        </div>
    ),
    th: ({ children }: any) => (
        <th className="bg-muted px-2 py-1.5 text-left text-xs font-semibold border-b border-border">
            {children}
        </th>
    ),
    td: ({ children }: any) => (
        <td className="px-2 py-1.5 text-xs border-b border-border">{children}</td>
    ),
    hr: () => <hr className="my-3 border-border" />,
    strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
};

// Regex to match node IDs in format: 8-char-pubkey-hash (e.g., XKZpmT4L-248235)
const NODE_ID_REGEX = /\b([A-HJ-NP-Za-km-z1-9]{8}-[0-9a-zA-Z]+)\b/g;

// Convert node IDs in content to markdown links
function processNodeLinks(content: string): string {
    return content.replace(NODE_ID_REGEX, (match) => {
        // Create a clickable link to the node details page
        return `[${match}](/nodes/${match})`;
    });
}

export function CopilotMessage({ message, isLast, onCopy, onRegenerate, onEdit, showActions = true }: CopilotMessageProps) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        onCopy?.(message.content);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEdit = () => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit?.(message.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(message.content);
        setIsEditing(false);
    };

    return (
        <div className={cn(
            "flex w-full gap-3 group",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            <div className={cn(
                "flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full border shadow-sm",
                isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
                {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div className="flex-1 space-y-1">
                <div className={cn(
                    "overflow-hidden rounded-xl px-3 py-2.5 text-sm shadow-sm",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border"
                )}>
                    {isUser ? (
                        isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full bg-primary-foreground text-primary rounded p-2 text-sm resize-none min-h-[60px]"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 text-xs text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleEdit} className="h-7 text-xs bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                                        Send
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )
                    ) : (
                        <div className="prose-copilot">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {processNodeLinks(message.content)}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                {showActions && !isEditing && message.content && (
                    <div className={cn(
                        "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        isUser ? "justify-end" : "justify-start"
                    )}>
                        {/* Copy button - for assistant messages */}
                        {!isUser && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                        )}

                        {/* Regenerate button - only for last assistant message */}
                        {!isUser && isLast && onRegenerate && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={onRegenerate}
                            >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Regenerate
                            </Button>
                        )}

                        {/* Edit button - for user messages */}
                        {isUser && onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
