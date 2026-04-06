import type React from 'react';
import type { ConditionHandle, ActionConfig, ActionKey } from '@/types';

// Condition handle definitions — each condition node has 4 labeled output handles
export const COND_HANDLES: ConditionHandle[] = [
    { id: 'exact', label: 'exact', color: '#4ade80' },
    { id: 'contain', label: 'contain', color: '#fbbf24' },
    { id: 'any', label: 'any / *', color: '#60a5fa' },
    { id: 'new', label: 'new / none', color: '#f87171' },
];

export const HANDLE_MAP: Record<string, ConditionHandle> = Object.fromEntries(
    COND_HANDLES.map(h => [h.id, h])
);

// Action definitions
export const ACTIONS: Record<ActionKey, ActionConfig> = {
    skip: { label: 'Skip', color: '#a1a1aa' },
    add_port: { label: 'Add Port', color: '#52525b' },
    add_number: { label: 'Add UR Number', color: '#3f3f46' },
    add_src: { label: 'Add Source & Comment', color: '#71717a' },
    add_dest: { label: 'Add Dest & Comment', color: '#27272a' },
    create: { label: 'Create New Rule', color: '#18181b' },
};

// Shared handle size style
export const HS: React.CSSProperties = { width: 11, height: 11, borderRadius: '3px' };
