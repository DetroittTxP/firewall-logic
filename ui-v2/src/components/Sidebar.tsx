'use client';

import { COND_HANDLES } from '@/constants';
import { PALETTE } from '@/data/initialGraph';
import type { ProfileMap, PaletteItem } from '@/types';

interface SidebarProps {
    profiles: ProfileMap;
    activeProfile: string;
    profileName: string;
    setProfileName: (name: string) => void;
    saveProfile: () => void;
    loadProfile: (name: string) => void;
    deleteProfile: (name: string) => void;
    openExport: () => void;
    clearAll: () => void;
    deleteSelected: () => void;
    selectedId: string | null;
}

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
                padding: '7px 10px',
                borderRadius: '6px',
                cursor: 'grab',
                userSelect: 'none',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
        >
            {item.label}
        </div>
    );
}

export function Sidebar({
    profiles,
    activeProfile,
    profileName,
    setProfileName,
    saveProfile,
    loadProfile,
    deleteProfile,
    openExport,
    clearAll,
    deleteSelected,
    selectedId,
}: SidebarProps) {
    return (
        <aside
            style={{
                width: '195px',
                flexShrink: 0,
                overflowY: 'auto',
                background: '#fafafa',
                borderRight: '1px solid #e4e4e7',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}
        >
            <div style={{ color: '#09090b', fontWeight: 'bold', fontSize: '13px' }}>
                🔥 Logic Builder
            </div>

            <div style={{ color: '#71717a', fontSize: '10px', lineHeight: 1.75 }}>
                <strong style={{ color: '#18181b' }}>Drag</strong> nodes onto the canvas.<br />
                <strong style={{ color: '#18181b' }}>Connect</strong> a handle to the next node.<br />
                Click a node then press{' '}
                <strong style={{ color: '#ef4444' }}>Delete</strong> to remove.
            </div>

            {/* Handle color legend */}
            <div
                style={{
                    background: '#f4f4f5',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    border: '1px solid #e4e4e7',
                }}
            >
                <div
                    style={{
                        color: '#71717a',
                        fontSize: '10px',
                        fontWeight: 700,
                        marginBottom: '5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}
                >
                    Condition outputs
                </div>
                {COND_HANDLES.map(h => (
                    <div
                        key={h.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}
                    >
                        <span
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: h.color,
                                flexShrink: 0,
                                display: 'inline-block',
                            }}
                        />
                        <span style={{ color: '#52525b', fontSize: '10px' }}>{h.label}</span>
                    </div>
                ))}
            </div>

            {/* Flow palette items */}
            {PALETTE.filter(g => g.group === 'Flow').map(group => (
                <div key={group.group}>
                    <div
                        style={{
                            color: '#71717a',
                            fontSize: '9px',
                            fontWeight: 700,
                            marginBottom: '5px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}
                    >
                        {group.group}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {group.items.map((item, i) => (
                            <DraggableItem key={i} item={item} />
                        ))}
                    </div>
                </div>
            ))}

            {/* Profiles */}
            <div
                style={{
                    background: '#f4f4f5',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    border: '1px solid #e4e4e7',
                }}
            >
                <div
                    style={{
                        color: '#71717a',
                        fontSize: '10px',
                        fontWeight: 700,
                        marginBottom: '7px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}
                >
                    Profiles
                </div>

                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    <input
                        className="nodrag"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveProfile()}
                        placeholder="profile name…"
                        style={{
                            flex: 1,
                            padding: '5px 7px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            background: '#ffffff',
                            color: '#09090b',
                            border: '1px solid #e4e4e7',
                            minWidth: 0,
                        }}
                    />
                    <button
                        onClick={saveProfile}
                        title="Save current canvas to this profile"
                        style={{
                            background: '#18181b',
                            color: '#fafafa',
                            border: 'none',
                            padding: '5px 8px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        💾
                    </button>
                </div>

                {Object.keys(profiles).length === 0 ? (
                    <div
                        style={{
                            color: '#a1a1aa',
                            fontSize: '10px',
                            textAlign: 'center',
                            padding: '4px 0',
                        }}
                    >
                        No profiles saved yet
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {Object.keys(profiles).map(name => (
                            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                    onClick={() => loadProfile(name)}
                                    title={`Load profile "${name}"`}
                                    style={{
                                        flex: 1,
                                        textAlign: 'left',
                                        padding: '5px 8px',
                                        borderRadius: '5px',
                                        background: activeProfile === name ? '#18181b' : '#ffffff',
                                        color: activeProfile === name ? '#fafafa' : '#52525b',
                                        border: `1px solid ${activeProfile === name ? '#09090b' : '#e4e4e7'}`,
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        fontWeight: activeProfile === name ? 700 : 400,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {activeProfile === name ? '▶ ' : ''}{name}
                                </button>
                                <button
                                    onClick={() => deleteProfile(name)}
                                    title={`Delete profile "${name}"`}
                                    style={{
                                        background: 'transparent',
                                        color: '#a1a1aa',
                                        border: '1px solid #e4e4e7',
                                        borderRadius: '5px',
                                        padding: '5px 6px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        flexShrink: 0,
                                    }}
                                >
                                    🗑
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                    onClick={openExport}
                    style={{
                        background: '#18181b',
                        color: '#fafafa',
                        border: 'none',
                        padding: '9px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        width: '100%',
                    }}
                >
                    📋 Export Logic
                </button>
                <button
                    onClick={clearAll}
                    style={{
                        background: '#ffffff',
                        color: '#ef4444',
                        border: '1px solid #fca5a5',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        width: '100%',
                    }}
                >
                    🗑 Clear All
                </button>
                {selectedId && (
                    <button
                        onClick={deleteSelected}
                        style={{
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            width: '100%',
                        }}
                    >
                        🗑 Delete Selected
                    </button>
                )}
            </div>
        </aside>
    );
}
