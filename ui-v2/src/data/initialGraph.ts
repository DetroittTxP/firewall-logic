import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import { ACTIONS, HANDLE_MAP } from '@/constants';
import { makeEdgeStyle } from '@/utils/edgeStyle';
import type { PaletteGroup, ActionKey } from '@/types';

export const PALETTE: PaletteGroup[] = [
    {
        group: 'Flow',
        items: [
            { type: 'startNode', label: '▶ Start', color: '#18181b', data: {} },
            { type: 'endNode', label: '🏁 Done', color: '#71717a', data: { label: 'Done' } },
        ],
    },
    {
        group: 'Check Field',
        items: [
            { type: 'conditionNode', label: '🔍 Check SRC', color: '#3f3f46', data: { field: 'src', match: 'exact' } },
            { type: 'conditionNode', label: '🔍 Check DEST', color: '#3f3f46', data: { field: 'dest', match: 'exact' } },
            { type: 'conditionNode', label: '🔍 Check PORT', color: '#3f3f46', data: { field: 'port', match: 'exact' } },
        ],
    },
    {
        group: 'Action',
        items: (Object.entries(ACTIONS) as [ActionKey, { label: string; color: string }][]).map(
            ([v, a]) => ({
                type: 'actionNode',
                label: `⚡ ${a.label}`,
                color: a.color,
                data: { action: v },
            }),
        ),
    },
];

/** Create an edge from a condition node (colors edge by match type). */
function mkCondEdge(id: string, source: string, target: string, match: string): Edge {
    const color = HANDLE_MAP[match]?.color ?? '#94a3b8';
    return {
        id,
        source,
        target,
        sourceHandle: 'out',
        markerEnd: { type: MarkerType.ArrowClosed, color },
        style: { stroke: color, strokeWidth: 2 },
    } as Edge;
}

/** Create a plain edge (Start → node, action → node). */
function mkEdge(id: string, source: string, target: string): Edge {
    return { id, source, target, ...makeEdgeStyle(null) } as Edge;
}

// ─── Initial demo graph ───────────────────────────────────────────────────────
//
//  Start
//    └─ c-src  [src, exact]
//         └─ c-dest [dest, exact]
//               ├─ c-port-new   [port, new]     → Add Port     → Done
//               ├─ c-port-exact [port, exact]   → Add UR Num   → Done
//               └─ c-port-cont  [port, contain] → Skip         → Done
//
export const INIT_NODES: Node[] = [
    { id: 'start',        type: 'startNode',     position: { x: 290, y: 20  }, data: {} },
    { id: 'c-src',        type: 'conditionNode', position: { x: 250, y: 120 }, data: { field: 'src',  match: 'exact'   } },
    { id: 'c-dest',       type: 'conditionNode', position: { x: 250, y: 270 }, data: { field: 'dest', match: 'exact'   } },
    { id: 'c-port-new',   type: 'conditionNode', position: { x: 20,  y: 430 }, data: { field: 'port', match: 'new'     } },
    { id: 'c-port-exact', type: 'conditionNode', position: { x: 260, y: 430 }, data: { field: 'port', match: 'exact'   } },
    { id: 'c-port-cont',  type: 'conditionNode', position: { x: 500, y: 430 }, data: { field: 'port', match: 'contain' } },
    { id: 'a-add-port',   type: 'actionNode',    position: { x: 20,  y: 600 }, data: { action: 'add_port'   } },
    { id: 'a-add-number', type: 'actionNode',    position: { x: 260, y: 600 }, data: { action: 'add_number' } },
    { id: 'a-skip',       type: 'actionNode',    position: { x: 500, y: 600 }, data: { action: 'skip'       } },
    { id: 'end',          type: 'endNode',       position: { x: 290, y: 760 }, data: { label: 'Done' } },
];

export const INIT_EDGES: Edge[] = [
    mkEdge('e0', 'start', 'c-src'),
    mkCondEdge('e1', 'c-src',        'c-dest',       'exact'),
    mkCondEdge('e2', 'c-dest',       'c-port-new',   'new'),
    mkCondEdge('e3', 'c-dest',       'c-port-exact', 'exact'),
    mkCondEdge('e4', 'c-dest',       'c-port-cont',  'contain'),
    mkCondEdge('e5', 'c-port-new',   'a-add-port',   'new'),
    mkCondEdge('e6', 'c-port-exact', 'a-add-number', 'exact'),
    mkCondEdge('e7', 'c-port-cont',  'a-skip',       'contain'),
    mkEdge('e8', 'a-add-port',   'end'),
    mkEdge('e9', 'a-add-number', 'end'),
    mkEdge('e10', 'a-skip',      'end'),
];

