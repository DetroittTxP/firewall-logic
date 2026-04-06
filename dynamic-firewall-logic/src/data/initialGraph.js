import { ACTIONS } from '../constants';
import { makeEdgeStyle } from '../utils/edgeStyle';

export const PALETTE = [
  {
    group: 'Flow',
    items: [
      { type: 'startNode', label: '▶ Start', color: '#18181b', data: {} },
      { type: 'endNode',   label: '🏁 Done', color: '#71717a', data: { label: 'Done' } },
    ],
  },
  {
    group: 'Check Field',
    items: [
      { type: 'conditionNode', label: '🔍 Check SRC',  color: '#3f3f46', data: { field: 'src'  } },
      { type: 'conditionNode', label: '🔍 Check DEST', color: '#3f3f46', data: { field: 'dest' } },
      { type: 'conditionNode', label: '🔍 Check PORT', color: '#3f3f46', data: { field: 'port' } },
    ],
  },
  {
    group: 'Action',
    items: Object.entries(ACTIONS).map(([v, a]) => ({
      type: 'actionNode', label: `⚡ ${a.label}`, color: a.color, data: { action: v },
    })),
  },
];

export const INIT_NODES = [
  { id: 'start',        type: 'startNode',     position: { x: 290, y: 30  }, data: {} },
  { id: 'c-src',        type: 'conditionNode', position: { x: 250, y: 130 }, data: { field: 'src'  } },
  { id: 'c-dest',       type: 'conditionNode', position: { x: 250, y: 290 }, data: { field: 'dest' } },
  { id: 'c-port',       type: 'conditionNode', position: { x: 250, y: 450 }, data: { field: 'port' } },
  { id: 'a-add-port',   type: 'actionNode',    position: { x: 30,  y: 615 }, data: { action: 'add_port'   } },
  { id: 'a-add-number', type: 'actionNode',    position: { x: 240, y: 615 }, data: { action: 'add_number' } },
  { id: 'a-skip',       type: 'actionNode',    position: { x: 450, y: 615 }, data: { action: 'skip'       } },
  { id: 'end',          type: 'endNode',       position: { x: 290, y: 770 }, data: { label: 'Done'        } },
];

function mkEdge(id, source, target, sourceHandle) {
  return {
    id, source, target,
    ...(sourceHandle ? { sourceHandle } : {}),
    ...makeEdgeStyle(sourceHandle),
  };
}

export const INIT_EDGES = [
  mkEdge('e0', 'start',        'c-src',         null),
  mkEdge('e1', 'c-src',        'c-dest',        'exact'),
  mkEdge('e2', 'c-dest',       'c-port',        'exact'),
  mkEdge('e3', 'c-port',       'a-add-port',    'new'),
  mkEdge('e4', 'c-port',       'a-add-number',  'exact'),
  mkEdge('e5', 'c-port',       'a-skip',        'contain'),
  mkEdge('e6', 'a-add-port',   'end',           null),
  mkEdge('e7', 'a-add-number', 'end',           null),
  mkEdge('e8', 'a-skip',       'end',           null),
];
