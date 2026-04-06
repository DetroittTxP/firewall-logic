import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HS } from '../constants';

export const EndNode = ({ data }) => (
  <div style={{
    padding: '10px 22px', borderRadius: '30px',
    background: '#f4f4f5', color: '#71717a', fontWeight: 'bold', fontSize: '12px',
    border: '2px solid #e4e4e7', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontFamily: 'sans-serif',
  }}>
    <Handle type="target" position={Position.Top} style={{ ...HS, background: '#a1a1aa', top: -6 }} />
    🏁 {data?.label ?? 'Done'}
  </div>
);
