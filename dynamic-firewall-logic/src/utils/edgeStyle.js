import { MarkerType } from '@xyflow/react';
import { HANDLE_MAP } from '../constants';

export function makeEdgeStyle(handleId) {
  const h = HANDLE_MAP[handleId];
  const color = h ? h.color : '#94a3b8';
  return {
    markerEnd: { type: MarkerType.ArrowClosed, color },
    style: { stroke: color, strokeWidth: 2 },
    ...(h ? {
      label: h.label,
      labelStyle: { fontSize: 10, fontWeight: 700, fill: color },
      labelBgStyle: { fill: '#ffffff', opacity: 0.95 },
      labelBgPadding: [4, 5],
    } : {}),
  };
}
