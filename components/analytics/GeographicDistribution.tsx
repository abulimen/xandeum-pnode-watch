/**
 * Geographic Distribution Chart
 * Shows top 3 countries with link to full map
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, MapPin, ArrowRight } from 'lucide-react';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';

// Country flag emoji helper
function getCountryFlag(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

interface GeographicDistributionProps {
    nodes: PNode[];
    isLoading?: boolean;
    limit?: number;
}

export function GeographicDistribution({ nodes, isLoading, limit = 3 }: GeographicDistributionProps) {
    const countryStats = useMemo(() => {
        const countryMap = new Map<string, { count: number; code: string; cities: Set<string> }>();

        nodes.forEach(node => {
            const country = node.location?.country;
            const code = node.location?.countryCode;
            const city = node.location?.city;

            if (country) {
                const existing = countryMap.get(country);
                if (existing) {
                    existing.count++;
                    if (city) existing.cities.add(city);
                } else {
                    countryMap.set(country, {
                        count: 1,
                        code: code || '',
                        cities: city ? new Set([city]) : new Set()
                    });
                }
            }
        });

        return Array.from(countryMap.entries())
            .map(([country, data]) => ({
                country,
                code: data.code,
                count: data.count,
                cityCount: data.cities.size,
                percentage: (data.count / nodes.length) * 100
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }, [nodes, limit]);

    const maxCount = countryStats[0]?.count || 1;

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Globe className="h-4 w-4" />
                        Geographic Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const withLocation = nodes.filter(n => n.location?.country).length;
    const pending = nodes.length - withLocation;

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Globe className="h-4 w-4 text-blue-500" />
                            Geographic Distribution
                        </CardTitle>
                        <CardDescription>
                            Top {limit} countries by node count
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                {countryStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Location data loading...
                    </p>
                ) : (
                    <div className="space-y-4">
                        {countryStats.map((stat, index) => (
                            <div key={stat.country} className="group">
                                <div className="flex items-center gap-3">
                                    {/* Flag */}
                                    <span className="text-xl">{getCountryFlag(stat.code)}</span>

                                    {/* Country name & bar */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium truncate">
                                                {stat.country}
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {stat.count} ({stat.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                                style={{ width: `${(stat.count / maxCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-2">
                    <Link href="/map" className="w-full">
                        <Button variant="outline" className="w-full gap-2 text-xs h-8">
                            <MapPin className="h-3.5 w-3.5" />
                            View Full Map
                            <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-50" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
