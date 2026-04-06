'use client';

import type { ExportModalTab, ExportResult } from '@/types';

interface ExportModalProps {
    modal: ExportResult | null;
    modalTab: ExportModalTab;
    setModalTab: (tab: ExportModalTab) => void;
    onClose: () => void;
}

const TABS: [ExportModalTab, string][] = [
    ['readable', '📖 Human Readable'],
    ['pseudo', '💻 Pseudocode'],
    ['yaml', '📄 YAML'],
    ['json', '🗂 JSON'],
];

export function ExportModal({ modal, modalTab, setModalTab, onClose }: ExportModalProps) {
    if (!modal) return null;

    const content =
        modalTab === 'readable' ? modal.readable
            : modalTab === 'pseudo' ? (modal.pseudo || '# (no connected flow to export)')
                : modalTab === 'yaml' ? (modal.yaml || '# (no connected flow to export)')
                    : (modal.json || '// (no connected flow to export)');

    const handleCopy = () => navigator.clipboard.writeText(content);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '10px',
                    width: '680px',
                    maxWidth: '92vw',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderBottom: '1px solid #e4e4e7',
                    }}
                >
                    <span style={{ color: '#09090b', fontWeight: 'bold', fontSize: '14px' }}>
                        📋 Logic Export
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#a1a1aa',
                            fontSize: '20px',
                            cursor: 'pointer',
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e4e4e7' }}>
                    {TABS.map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setModalTab(key)}
                            style={{
                                flex: 1,
                                padding: '9px',
                                border: 'none',
                                cursor: 'pointer',
                                background: modalTab === key ? '#f4f4f5' : 'transparent',
                                color: modalTab === key ? '#09090b' : '#71717a',
                                fontWeight: modalTab === key ? 700 : 400,
                                fontSize: '12px',
                                borderBottom: modalTab === key ? '2px solid #18181b' : '2px solid transparent',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
                    <pre
                        style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontFamily: modalTab === 'readable' ? 'sans-serif' : 'monospace',
                            fontSize: modalTab === 'readable' ? '13px' : '12px',
                            lineHeight: 1.85,
                            color: '#09090b',
                        }}
                    >
                        {content}
                    </pre>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '10px 18px',
                        borderTop: '1px solid #e4e4e7',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                    }}
                >
                    <button
                        onClick={handleCopy}
                        style={{
                            background: '#f4f4f5',
                            color: '#09090b',
                            border: '1px solid #e4e4e7',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        📋 Copy
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#18181b',
                            color: '#fafafa',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
