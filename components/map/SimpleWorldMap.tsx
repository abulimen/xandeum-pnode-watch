/**
 * SimpleWorldMap Component - SVG-based world map with node markers
 * This component doesn't rely on external tile servers
 */

'use client';

import { useState, useMemo } from 'react';
import { PNode } from '@/types/pnode';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

interface SimpleWorldMapProps {
    nodes: PNode[];
}

// Convert lat/lng to SVG coordinates
function latLngToXY(lat: number, lng: number, width: number, height: number): { x: number; y: number } {
    // Simple equirectangular projection
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
}

const statusColors = {
    online: '#10b981',
    degraded: '#f59e0b',
    offline: '#ef4444',
};

export function SimpleWorldMap({ nodes }: SimpleWorldMapProps) {
    const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const width = 900;
    const height = 450;

    const nodesWithCoords = useMemo(
        () => nodes.filter(n => n.location?.coordinates),
        [nodes]
    );

    const nodePositions = useMemo(() => {
        return nodesWithCoords.map(node => {
            const { x, y } = latLngToXY(
                node.location!.coordinates!.lat,
                node.location!.coordinates!.lng,
                width,
                height
            );
            return { node, x, y };
        });
    }, [nodesWithCoords]);

    return (
        <div className="relative w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden">
            {/* SVG World Map */}
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Background */}
                <rect width={width} height={height} fill="#0f172a" />

                {/* Grid lines */}
                <g stroke="#1e293b" strokeWidth="0.5">
                    {/* Longitude lines */}
                    {Array.from({ length: 13 }).map((_, i) => (
                        <line
                            key={`lng-${i}`}
                            x1={(i * width) / 12}
                            y1={0}
                            x2={(i * width) / 12}
                            y2={height}
                        />
                    ))}
                    {/* Latitude lines */}
                    {Array.from({ length: 7 }).map((_, i) => (
                        <line
                            key={`lat-${i}`}
                            x1={0}
                            y1={(i * height) / 6}
                            x2={width}
                            y2={(i * height) / 6}
                        />
                    ))}
                </g>

                {/* Simplified continent outlines */}
                <g fill="#1e3a5f" stroke="#2563eb" strokeWidth="0.5" opacity="0.6">
                    {/* North America */}
                    <path d="M 50 80 L 180 60 L 230 100 L 220 180 L 150 200 L 100 180 L 60 130 Z" />
                    {/* South America */}
                    <path d="M 140 220 L 180 210 L 200 280 L 180 360 L 140 380 L 120 320 L 130 260 Z" />
                    {/* Europe */}
                    <path d="M 380 80 L 450 70 L 470 110 L 440 140 L 390 130 L 370 100 Z" />
                    {/* Africa */}
                    <path d="M 380 150 L 450 140 L 500 200 L 480 300 L 420 340 L 370 280 L 380 200 Z" />
                    {/* Asia */}
                    <path d="M 480 50 L 700 40 L 780 100 L 750 180 L 650 200 L 550 160 L 480 120 Z" />
                    {/* Australia */}
                    <path d="M 680 280 L 780 280 L 800 340 L 750 380 L 680 360 L 660 320 Z" />
                </g>

                {/* Region labels */}
                <g fill="#64748b" fontSize="10" fontFamily="sans-serif">
                    <text x="120" y="130">North America</text>
                    <text x="140" y="300">South America</text>
                    <text x="400" y="100">Europe</text>
                    <text x="400" y="240">Africa</text>
                    <text x="600" y="100">Asia</text>
                    <text x="700" y="330">Oceania</text>
                </g>

                {/* Node markers */}
                {nodePositions.map(({ node, x, y }) => (
                    <g key={node.id}>
                        {/* Pulse animation for online nodes */}
                        {node.status === 'online' && (
                            <circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill={statusColors[node.status]}
                                opacity="0.3"
                            >
                                <animate
                                    attributeName="r"
                                    from="8"
                                    to="16"
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                />
                                <animate
                                    attributeName="opacity"
                                    from="0.3"
                                    to="0"
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        )}

                        {/* Main marker */}
                        <circle
                            cx={x}
                            cy={y}
                            r={hoveredNode === node.id ? 8 : 6}
                            fill={statusColors[node.status]}
                            stroke="#fff"
                            strokeWidth="2"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={() => setSelectedNode(node)}
                        />
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur rounded-lg p-3 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">Online</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-300">Degraded</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-300">Offline</span>
                </div>
            </div>

            {/* Node count badge */}
            <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur rounded-lg px-3 py-2 text-sm text-slate-300">
                {nodesWithCoords.length} nodes displayed
            </div>

            {/* Selected node popup */}
            {selectedNode && (
                <div
                    className="absolute bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-xl min-w-[240px]"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-white">{selectedNode.id}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-white"
                            onClick={() => setSelectedNode(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="mb-3">
                        <StatusBadge status={selectedNode.status} showLabel />
                    </div>

                    <div className="space-y-1 text-sm text-slate-400 mb-4">
                        <p>Uptime: <span className="text-white">{selectedNode.uptime.toFixed(1)}%</span></p>
                        <p>Response: <span className="text-white">{selectedNode.responseTime}ms</span></p>
                        <p>Location: <span className="text-white">{selectedNode.location?.city}, {selectedNode.location?.country}</span></p>
                    </div>

                    <Button size="sm" className="w-full" asChild>
                        <Link href={`/nodes/${selectedNode.id}`}>
                            View Details
                            <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
