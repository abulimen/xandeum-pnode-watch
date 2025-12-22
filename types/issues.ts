/**
 * Node issue and alert type definitions
 */

export type IssueSeverity = 'low' | 'medium' | 'high';

export type IssueType =
    | 'low_uptime'
    | 'high_latency'
    | 'storage_full'
    | 'offline'
    | 'stale';

export interface NodeIssue {
    id: string;
    nodeId: string;
    type: IssueType;
    severity: IssueSeverity;
    message: string;
    timestamp: string;
    value?: number;
    threshold?: number;
}

