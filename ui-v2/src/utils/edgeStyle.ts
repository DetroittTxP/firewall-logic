import { MarkerType } from '@xyflow/react';
import type { Edge } from '@xyflow/react';
import { HANDLE_MAP } from '@/constants';

/**
 * Returns edge style props.
 * Pass `matchOverride` (e.g. a condition node's match value like 'exact') to
 * look up color/label from HANDLE_MAP when the physical handle id is 'out'.
 */
export function makeEdgeStyle(
    handleId: string | null | undefined,
    matchOverride?: string,
): Partial<Edge> {
    const lookupKey = matchOverride ?? handleId;
    const h = lookupKey ? HANDLE_MAP[lookupKey] : undefined;
    const color = h ? h.color : '#94a3b8';
    return {
        markerEnd: { type: MarkerType.ArrowClosed, color },
        style: { stroke: color, strokeWidth: 2 },
    };
}
