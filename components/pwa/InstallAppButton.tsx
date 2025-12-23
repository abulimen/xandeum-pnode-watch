/**
 * Install App Button & Modal
 * Shows manual install instructions for all platforms
 */

'use client';

import { useState } from 'react';
import { Download, Smartphone, Share, Plus, MoreVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Detect platform
function getPlatform() {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'desktop';
}

export function InstallAppButton() {
    const [open, setOpen] = useState(false);
    const platform = getPlatform();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Install App</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Install pNode Watch
                    </DialogTitle>
                    <DialogDescription>
                        Add pNode Watch to your device for quick access and offline support
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={platform} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ios">iOS</TabsTrigger>
                        <TabsTrigger value="android">Android</TabsTrigger>
                        <TabsTrigger value="desktop">Desktop</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ios" className="mt-4 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                                <div>
                                    <p className="font-medium">Tap the Share button</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Share className="h-4 w-4" /> at the bottom of Safari
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                                <div>
                                    <p className="font-medium">Scroll down and tap</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Plus className="h-4 w-4" /> "Add to Home Screen"
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                                <div>
                                    <p className="font-medium">Tap "Add"</p>
                                    <p className="text-sm text-muted-foreground">The app will appear on your home screen</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="android" className="mt-4 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                                <div>
                                    <p className="font-medium">Tap the menu button</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MoreVertical className="h-4 w-4" /> in Chrome (top right)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                                <div>
                                    <p className="font-medium">Tap "Install app" or</p>
                                    <p className="text-sm text-muted-foreground">"Add to Home screen"</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                                <div>
                                    <p className="font-medium">Confirm by tapping "Install"</p>
                                    <p className="text-sm text-muted-foreground">The app will appear in your app drawer</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="desktop" className="mt-4 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                                <div>
                                    <p className="font-medium">Look for the install icon</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Download className="h-4 w-4" /> in your browser's address bar
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                                <div>
                                    <p className="font-medium">Click "Install"</p>
                                    <p className="text-sm text-muted-foreground">Or use Chrome menu → "Install pNode Watch"</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                                <div>
                                    <p className="font-medium">Done!</p>
                                    <p className="text-sm text-muted-foreground">The app will open in its own window</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        💡 <strong>Tip:</strong> Once installed, you'll get faster load times and can use the app offline!
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
