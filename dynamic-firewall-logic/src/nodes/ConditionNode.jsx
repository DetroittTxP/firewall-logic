import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { COND_HANDLES, HS } from '../constants';

export const ConditionNode = ({ id, data }) => (
  <div style={{
    padding: '10px 12px 28px', borderRadius: '8px',
    background: '#ffffff', color: '#09090b', fontSize: '12px',
    fontFamily: 'sans-serif', border: '2px solid #18181b',
    minWidth: '215px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
  }}>
    <Handle type="target" position={Position.Top} style={{ ...HS, background: '#71717a', top: -6 }} />

    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#18181b', fontSize: '13px' }}>
      🔍 Check Field
    </div>

    <select
      value={data.field}
      onChange={e => data.updateNode(id, { field: e.target.value })}
      className="nodrag"
      style={{
        width: '100%', padding: '5px 8px', borderRadius: '5px',
        background: '#f4f4f5', color: '#09090b',
        border: '1px solid #e4e4e7', fontSize: '12px', cursor: 'pointer',
      }}
    >
      <option value="src">SRC — Source IP</option>
      <option value="dest">DEST — Destination IP</option>
      <option value="port">PORT / Protocol</option>
    </select>

    {/* Handle labels row */}
    <div style={{
      display: 'flex', position: 'absolute',
      bottom: 6, left: 0, right: 0, padding: '0 4px',
    }}>
      {COND_HANDLES.map(h => (
        <span key={h.id} style={{
          color: h.color, fontSize: '9px', textAlign: 'center',
          flex: 1, fontWeight: 600,
        }}>
          {h.label}
        </span>
      ))}
    </div>

    {/* Output handles */}
    {COND_HANDLES.map((h, i) => (
      <Handle
        key={h.id}
        type="source"
        position={Position.Bottom}
        id={h.id}
        style={{
          ...HS,
          left: `${(i + 0.5) * 25}%`,
          bottom: -6,
          background: h.color,
          borderRadius: '50%',
          border: '2px solid #ffffff',
        }}
      />
    ))}
  </div>
);
