import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ACTIONS, HS } from '../constants';

export const ActionNode = ({ id, data }) => {
  const cfg = ACTIONS[data.action] ?? ACTIONS.skip;
  return (
    <div style={{
      padding: '10px 12px', borderRadius: '8px',
      background: '#f4f4f5', color: '#09090b', fontSize: '12px',
      fontFamily: 'sans-serif', border: `2px solid ${cfg.color}`,
      minWidth: '165px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <Handle type="target" position={Position.Top} style={{ ...HS, background: '#71717a', top: -6 }} />

      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: cfg.color, fontSize: '11px' }}>
        ⚡ Action
      </div>

      <select
        value={data.action}
        onChange={e => data.updateNode(id, { action: e.target.value })}
        className="nodrag"
        style={{
          width: '100%', padding: '5px 8px', borderRadius: '5px',
          background: '#ffffff', color: '#09090b',
          border: '1px solid #e4e4e7', fontSize: '12px', cursor: 'pointer',
        }}
      >
        {Object.entries(ACTIONS).map(([v, a]) => (
          <option key={v} value={v}>{a.label}</option>
        ))}
      </select>

      <Handle type="source" position={Position.Bottom} style={{ ...HS, background: '#71717a', bottom: -6 }} />
    </div>
  );
};
