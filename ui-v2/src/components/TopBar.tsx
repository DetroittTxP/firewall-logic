'use client';

import { PALETTE } from '@/data/initialGraph';
import type { PaletteItem } from '@/types';

function DraggableItem({ item }: { item: PaletteItem }) {
    return (
        <div
            draggable
            onDragStart={e => {
                e.dataTransfer.setData('rf/type', item.type);
                e.dataTransfer.setData('rf/data', JSON.stringify(item.data));
                e.dataTransfer.effectAllowed = 'move';
            }}
            style={{
                background: item.color,
                color: '#fafafa',
                padding: '5px 10px',
                borderRadius: '6px',
                cursor: 'grab',
                userSelect: 'none',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                whiteSpace: 'nowrap',
            }}
        >
            {item.label}
        </div>
    );
}

export function TopBar({ onRun }: { onRun: () => void }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                background: '#fafafa',
                borderBottom: '1px solid #e4e4e7',
                padding: '7px 14px',
                flexShrink: 0,
                overflowX: 'auto',
            }}
        >
            {PALETTE.filter(g => g.group !== 'Flow').map(group => (
                <div
                    key={group.group}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                    }}
                >
                    <span
                        style={{
                            color: '#71717a',
                            fontSize: '9px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            marginRight: '2px',
                        }}
                    >
                        {group.group}
                    </span>
                    {group.items.map((item, i) => (
                        <DraggableItem key={i} item={item} />
                    ))}
                    <span
                        style={{
                            width: '1px',
                            height: '24px',
                            background: '#e4e4e7',
                            marginLeft: '4px',
                        }}
                    />
                </div>
            ))}

            {/* Run button */}
            <button
                onClick={onRun}
                style={{
                    marginLeft: 'auto',
                    flexShrink: 0,
                    background: '#18181b',
                    color: '#fafafa',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}
            >
                ▶  Run
            </button>
        </div>
    );
}
