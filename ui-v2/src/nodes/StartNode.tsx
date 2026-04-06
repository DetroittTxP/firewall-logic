import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { HS } from '@/constants';

export function StartNode(_props: NodeProps) {
    return (
        <div
            style={{
                padding: '10px 22px',
                borderRadius: '30px',
                background: '#18181b',
                color: '#fafafa',
                fontWeight: 'bold',
                fontSize: '13px',
                border: '2px solid #09090b',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontFamily: 'sans-serif',
            }}
        >
            ▶ New Firewall Rule Arrives
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ ...HS, background: '#fafafa', bottom: -6 }}
            />
        </div>
    );
}
