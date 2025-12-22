/**
 * Footer Component
 */

import { Github, Twitter, Globe, MessageCircle, Youtube, Linkedin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-auto mb-10">
            <div className="container flex flex-col gap-6 py-8 px-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-auto items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="pNode Watch" className="h-6 w-auto object-contain dark:hidden" />
                            <img src="/logo.png" alt="pNode Watch" className="h-6 w-auto object-contain hidden dark:block" />
                        </div>
                        <span className="font-semibold text-foreground" style={{ marginLeft: "-10px" }}>
                            Node Watch
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Real-time monitoring and analytics for the Xandeum pNode network.
                    </p>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <Link
                            href="https://xandeum.network"
                            target="_blank"
                            className="hover:text-primary transition-colors flex items-center gap-1"
                        >
                            <Globe className="h-3 w-3" />
                            Website
                        </Link>
                        <Link
                            href="https://docs.xandeum.network"
                            target="_blank"
                            className="hover:text-primary transition-colors"
                        >
                            Docs
                        </Link>
                        <Link
                            href="/privacy"
                            className="hover:text-primary transition-colors"
                        >
                            Privacy
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="https://twitter.com/XandeumNetwork"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="Twitter"
                        >
                            <Twitter className="h-4 w-4" />
                            <span className="sr-only">Twitter</span>
                        </Link>
                        <Link
                            href="https://discord.com/invite/B88jTAYBhZ"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="Discord"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="sr-only">Discord</span>
                        </Link>
                        <Link
                            href="https://t.me/XandeumLabs"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="Telegram"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            <span className="sr-only">Telegram</span>
                        </Link>
                        <Link
                            href="https://www.youtube.com/@BlockchainBernie"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="YouTube"
                        >
                            <Youtube className="h-4 w-4" />
                            <span className="sr-only">YouTube</span>
                        </Link>
                        <Link
                            href="https://www.linkedin.com/company/xandeum-labs/"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="LinkedIn"
                        >
                            <Linkedin className="h-4 w-4" />
                            <span className="sr-only">LinkedIn</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-border/40 bg-muted/20">
                <div className="container py-4 px-4 text-center md:text-left">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} pNode Watch. Built by{' '}
                        <a
                            href="https://xpansieve.com.ng"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            XpanSieve Solutions
                        </a>
                        . This platform is a community-built initiative to support Xandeum operators and is not an official product of Xandeum Labs.
                    </p>
                </div>
            </div>
        </footer>
    );
}
