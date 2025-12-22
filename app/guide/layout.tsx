'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Menu, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GUIDE_NAVIGATION } from './guide-data';
import { useNodes, useNetworkStats } from '@/hooks';

const DOCS_URL = 'https://docs.xandeum.network';

export default function GuideLayout({ children }: { children: React.ReactNode }) {
    const { nodes } = useNodes();
    const { issueCount } = useNetworkStats(nodes);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Helper to check if a link is active
    const isActive = (id: string) => {
        return pathname === `/guide/${id}` || (pathname === '/guide' && id === 'introduction');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header issueCount={issueCount} />

            <div className="flex-1 flex overflow-hidden">
                {/* Mobile Sidebar Toggle */}
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed bottom-4 left-4 z-50 lg:hidden shadow-lg"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>

                {/* Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 bg-background border-r transform transition-transform duration-200 lg:relative lg:translate-x-0 pt-16 lg:pt-0 flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="px-6 py-6 border-b">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="font-bold text-lg">Documentation</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Everything you need to know
                        </p>
                    </div>

                    <ScrollArea className="flex-1 py-6">
                        <nav className="space-y-6 px-4">
                            {GUIDE_NAVIGATION.map((group) => (
                                <div key={group.title}>
                                    <h4 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {group.title}
                                    </h4>
                                    <ul className="space-y-1">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const active = isActive(item.id);
                                            return (
                                                <li key={item.id}>
                                                    <Link
                                                        href={`/guide/${item.id}`}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={cn(
                                                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                                                            active
                                                                ? "bg-primary text-primary-foreground"
                                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        )}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        {item.title}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>

                        <div className="px-6 mt-8 pb-6">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Need more details?
                                    </p>
                                    <Link
                                        href={DOCS_URL}
                                        target="_blank"
                                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                        Official Xandeum Docs
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-muted/5">
                    <div className="max-w-4xl mx-auto px-6 py-8 min-h-full flex flex-col">
                        {children}
                        <div className="mt-auto pt-12">
                            <Footer />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
