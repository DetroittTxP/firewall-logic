import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { HANDLE_MAP, HS } from '@/constants';
import type { UpdateNodeFn, ConditionField, ConditionMatch } from '@/types';

const FIELD_OPTIONS: { value: ConditionField; label: string }[] = [
    { value: 'src',  label: 'SRC — Source IP' },
    { value: 'dest', label: 'DEST — Destination IP' },
    { value: 'port', label: 'PORT / Protocol' },
];

const MATCH_OPTIONS: { value: ConditionMatch; label: string }[] = [
    { value: 'exact',   label: 'exact' },
    { value: 'contain', label: 'contain' },
    { value: 'any',     label: 'any / *' },
    { value: 'new',     label: 'new / none' },
];

const FIELD_LABELS: Record<ConditionField, string> = {
    src:  'source',
    dest: 'destination',
    port: 'port',
};

export function ConditionNode({ id, data }: NodeProps) {
    const updateNode = data.updateNode as UpdateNodeFn;
    const field = (data.field as ConditionField) ?? 'src';
    const match = (data.match as ConditionMatch) ?? 'exact';
    const matchColor = HANDLE_MAP[match]?.color ?? '#94a3b8';

    return (
        <div
            style={{
                padding: '10px 12px 14px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#09090b',
                fontSize: '12px',
                fontFamily: 'sans-serif',
                border: `2px solid ${matchColor}`,
                minWidth: '215px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
            }}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{ ...HS, background: '#71717a', top: -6 }}
            />

            <div
                style={{
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#18181b',
                    fontSize: '13px',
                }}
            >
                🔍 Check Field
            </div>

            {/* Field dropdown */}
            <select
                value={field}
                onChange={e => updateNode(id, { field: e.target.value as ConditionField })}
                className="nodrag"
                style={{
                    width: '100%',
                    padding: '5px 8px',
                    borderRadius: '5px',
                    background: '#f4f4f5',
                    color: '#09090b',
                    border: '1px solid #e4e4e7',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginBottom: '6px',
                }}
            >
                {FIELD_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            {/* Match dropdown */}
            <select
                value={match}
                onChange={e => updateNode(id, { match: e.target.value as ConditionMatch })}
                className="nodrag"
                style={{
                    width: '100%',
                    padding: '5px 8px',
                    borderRadius: '5px',
                    background: '#f4f4f5',
                    color: '#09090b',
                    border: '1px solid #e4e4e7',
                    fontSize: '12px',
                    cursor: 'pointer',
                }}
            >
                {MATCH_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            {/* Condition preview */}
            <div
                style={{
                    marginTop: '8px',
                    padding: '5px 8px',
                    borderRadius: '4px',
                    background: '#f4f4f5',
                    fontSize: '11px',
                    color: '#3f3f46',
                }}
            >
                if{' '}
                <strong style={{ color: '#09090b' }}>{FIELD_LABELS[field]}</strong>
                {' '}is{' '}
                <strong style={{ color: matchColor }}>{HANDLE_MAP[match]?.label ?? match}</strong>
            </div>

            {/* Single output handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="out"
                style={{ ...HS, bottom: -6, background: matchColor }}
            />
        </div>
    );
}
