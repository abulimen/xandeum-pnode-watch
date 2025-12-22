/**
 * NodeMap Component - Leaflet map with pNode markers
 */

'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { PNode } from '@/types/pnode';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Leaflet CSS is imported in globals.css

interface NodeMapProps {
    nodes: PNode[];
    selectedNodeId?: string;
    onNodeSelect?: (nodeId: string) => void;
}

// Custom marker icons by status
const createMarkerIcon = (status: 'online' | 'offline' | 'degraded') => {
    const colors = {
        online: '#10b981',
        degraded: '#f59e0b',
        offline: '#ef4444',
    };

    return new DivIcon({
        html: `<div style="
      background-color: ${colors[status]};
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
        className: 'custom-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });
};

// Component to fit map bounds to markers
function FitBounds({ nodes }: { nodes: PNode[] }) {
    const map = useMap();

    useEffect(() => {
        if (nodes.length === 0) return;

        const bounds = nodes
            .filter(n => n.location?.coordinates)
            .map(n => [n.location!.coordinates!.lat, n.location!.coordinates!.lng] as [number, number]);

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [nodes, map]);

    return null;
}

export function NodeMap({ nodes, selectedNodeId, onNodeSelect }: NodeMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-[500px] bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Loading map...</p>
            </div>
        );
    }

    const nodesWithCoords = nodes.filter(n => n.location?.coordinates);

    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            className="h-[500px] w-full"
            style={{ background: 'hsl(var(--muted))' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <FitBounds nodes={nodesWithCoords} />

            {nodesWithCoords.map((node) => (
                <Marker
                    key={node.id}
                    position={[node.location!.coordinates!.lat, node.location!.coordinates!.lng]}
                    icon={createMarkerIcon(node.status)}
                    eventHandlers={{
                        click: () => onNodeSelect?.(node.id),
                    }}
                >
                    <Popup>
                        <div className="p-2 min-w-[200px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{node.id}</span>
                                <StatusBadge status={node.status} showLabel size="sm" />
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Uptime: {node.uptime.toFixed(1)}%</p>
                                <p>Response: {node.responseTime}ms</p>
                                <p>Location: {node.location?.city}, {node.location?.country}</p>
                            </div>
                            <Button size="sm" className="w-full mt-3" asChild>
                                <Link href={`/nodes/${node.id}`}>
                                    View Details
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
