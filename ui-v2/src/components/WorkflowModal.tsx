'use client';

import { Fragment } from 'react';
import type { WorkflowPath } from '@/types';

interface WorkflowModalProps {
    paths: WorkflowPath[] | null;
    onClose: () => void;
}

export function WorkflowModal({ paths, onClose }: WorkflowModalProps) {
    if (!paths) return null;

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
                    width: '820px',
                    maxWidth: '94vw',
                    maxHeight: '85vh',
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
                        flexShrink: 0,
                    }}
                >
                    <span style={{ color: '#09090b', fontWeight: 'bold', fontSize: '14px' }}>
                        ▶  Workflow — All Paths
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

                {/* Body */}
                <div
                    style={{
                        overflowY: 'auto',
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                    }}
                >
                    {paths.length === 0 ? (
                        <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
                            ⚠ No complete path found. Connect a Start node through to a Done node.
                        </p>
                    ) : (
                        paths.map((path, pi) => (
                            <div key={pi}>
                                {/* Path label */}
                                <div
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        color: '#a1a1aa',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        marginBottom: '7px',
                                    }}
                                >
                                    Path {pi + 1}
                                </div>

                                {/* Step chain */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    {path.map((step, si) => (
                                        <Fragment key={si}>
                                            {/* Step box */}
                                            <div
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: step.type === 'start' || step.type === 'end' ? '20px' : '6px',
                                                    background: step.type === 'action'
                                                        ? step.color
                                                        : step.type === 'start'
                                                            ? '#18181b'
                                                            : '#ffffff',
                                                    color: step.type === 'action' || step.type === 'start'
                                                        ? '#fafafa'
                                                        : step.type === 'end'
                                                            ? '#52525b'
                                                            : '#09090b',
                                                    border: step.type === 'condition'
                                                        ? `2px solid ${step.color}`
                                                        : step.type === 'end'
                                                            ? '2px solid #d4d4d8'
                                                            : 'none',
                                                    fontSize: '12px',
                                                    fontWeight: step.type === 'condition' ? 600 : 500,
                                                    whiteSpace: 'nowrap',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                }}
                                            >
                                                {step.label}
                                            </div>

                                            {/* Arrow between steps */}
                                            {si < path.length - 1 && (
                                                <span
                                                    style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: 1 }}
                                                >
                                                    →
                                                </span>
                                            )}
                                        </Fragment>
                                    ))}
                                </div>

                                {/* Divider between paths */}
                                {pi < paths.length - 1 && (
                                    <div
                                        style={{
                                            marginTop: '14px',
                                            borderBottom: '1px solid #f4f4f5',
                                        }}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
