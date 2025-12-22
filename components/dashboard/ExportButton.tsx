/**
 * ExportButton Component - Dropdown for CSV/JSON export
 */

'use client';

import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PNode } from '@/types/pnode';
import { exportNodesCSV, exportNodesJSON, generateFilename } from '@/lib/utils/export';
import { toast } from 'sonner';

interface ExportButtonProps {
    nodes: PNode[];
    label?: string;
}

export function ExportButton({ nodes, label = 'Export' }: ExportButtonProps) {
    const handleExportCSV = () => {
        try {
            const filename = generateFilename('pnodes-export', 'csv');
            exportNodesCSV(nodes, filename);
            toast.success(`Exported ${nodes.length} nodes to ${filename}`);
        } catch (error) {
            toast.error('Failed to export CSV');
        }
    };

    const handleExportJSON = () => {
        try {
            const filename = generateFilename('pnodes-export', 'json');
            exportNodesJSON(nodes, filename);
            toast.success(`Exported ${nodes.length} nodes to ${filename}`);
        } catch (error) {
            toast.error('Failed to export JSON');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export as JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
