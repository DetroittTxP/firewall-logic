'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import {
    ReactFlow,
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    useReactFlow,
} from '@xyflow/react';
import type { Connection, Node, Edge } from '@xyflow/react';
import { ACTIONS } from '@/constants';
import { makeEdgeStyle } from '@/utils/edgeStyle';
import { buildLogic, buildYAML } from '@/utils/exporters';
import { nodeTypes } from '@/nodes';
import { INIT_NODES, INIT_EDGES } from '@/data/initialGraph';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { ExportModal } from '@/components/ExportModal';
import type { ProfileMap, ExportResult, ExportModalTab } from '@/types';

let nid = 100;

export function FlowCanvas() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState(INIT_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INIT_EDGES);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modal, setModal] = useState<ExportResult | null>(null);
    const [modalTab, setModalTab] = useState<ExportModalTab>('readable');

    // ── Profiles ────────────────────────────────────────────
    const [profiles, setProfiles] = useState<ProfileMap>(() => {
        if (typeof window === 'undefined') return {};
        try {
            return JSON.parse(localStorage.getItem('fw_profiles') ?? '{}') as ProfileMap;
        } catch {
            return {};
        }
    });
    const [activeProfile, setActiveProfile] = useState('');
    const [profileName, setProfileName] = useState('');

    const saveProfile = useCallback(() => {
        const name = profileName.trim();
        if (!name) return;
        const cleanNodes = nodes.map(({ data: { updateNode: _u, ...rest }, ...n }) => ({
            ...n,
            data: rest,
        }));
        const updated: ProfileMap = { ...profiles, [name]: { nodes: cleanNodes as Node[], edges } };
        setProfiles(updated);
        setActiveProfile(name);
        localStorage.setItem('fw_profiles', JSON.stringify(updated));
    }, [profileName, profiles, nodes, edges]);

    const loadProfile = useCallback(
        (name: string) => {
            const p = profiles[name];
            if (!p) return;
            setNodes(p.nodes);
            setEdges(p.edges);
            setActiveProfile(name);
            setProfileName(name);
        },
        [profiles, setNodes, setEdges],
    );

    const deleteProfile = useCallback(
        (name: string) => {
            if (!window.confirm(`Delete profile "${name}"?`)) return;
            const updated = { ...profiles };
            delete updated[name];
            setProfiles(updated);
            localStorage.setItem('fw_profiles', JSON.stringify(updated));
            if (activeProfile === name) {
                setActiveProfile('');
                setProfileName('');
            }
        },
        [profiles, activeProfile],
    );

    // ── Canvas actions ───────────────────────────────────────
    const openExport = useCallback(() => {
        const result = buildLogic(nodes, edges);
        setModal({ ...result, yaml: buildYAML(nodes, edges) });
        setModalTab('readable');
    }, [nodes, edges]);

    const updateNode = useCallback(
        (id: string, patch: Record<string, unknown>) => {
            setNodes(nds =>
                nds.map(n => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
            );
        },
        [setNodes],
    );

    const nodesWithUpdater = useMemo(
        () => nodes.map(n => ({ ...n, data: { ...n.data, updateNode } })),
        [nodes, updateNode],
    );

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges(eds =>
                addEdge({ ...params, ...makeEdgeStyle(params.sourceHandle) } as Edge, eds),
            );
        },
        [setEdges],
    );

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('rf/type');
            const dataStr = e.dataTransfer.getData('rf/data');
            if (!type) return;
            const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            const data = dataStr ? (JSON.parse(dataStr) as Record<string, unknown>) : {};
            setNodes(nds => [...nds, { id: `n${nid++}`, type, position, data }]);
        },
        [screenToFlowPosition, setNodes],
    );

    const deleteSelected = useCallback(() => {
        if (!selectedId) return;
        setNodes(nds => nds.filter(n => n.id !== selectedId));
        setEdges(eds => eds.filter(e => e.source !== selectedId && e.target !== selectedId));
        setSelectedId(null);
    }, [selectedId, setNodes, setEdges]);

    const clearAll = useCallback(() => {
        if (!window.confirm('Clear all nodes and connections?')) return;
        setNodes([]);
        setEdges([]);
        setSelectedId(null);
    }, [setNodes, setEdges]);

    return (
        <div
            style={{
                display: 'flex',
                width: '100vw',
                height: '100vh',
                fontFamily: 'sans-serif',
                background: '#ffffff',
            }}
        >
            <Sidebar
                profiles={profiles}
                activeProfile={activeProfile}
                profileName={profileName}
                setProfileName={setProfileName}
                saveProfile={saveProfile}
                loadProfile={loadProfile}
                deleteProfile={deleteProfile}
                openExport={openExport}
                clearAll={clearAll}
                deleteSelected={deleteSelected}
                selectedId={selectedId}
            />

            <ExportModal
                modal={modal}
                modalTab={modalTab}
                setModalTab={setModalTab}
                onClose={() => setModal(null)}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopBar />

                <div
                    style={{ flex: 1 }}
                    ref={wrapperRef}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                >
                    <ReactFlow
                        nodes={nodesWithUpdater}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={(_, n) => setSelectedId(n.id)}
                        onPaneClick={() => setSelectedId(null)}
                        nodeTypes={nodeTypes}
                        deleteKeyCode="Delete"
                        snapToGrid
                        snapGrid={[15, 15]}
                        fitView
                    >
                        <Background />
                        <Controls
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e4e4e7',
                                borderRadius: '6px',
                            }}
                        />
                        <MiniMap
                            style={{ background: '#fafafa', border: '1px solid #e4e4e7' }}
                            nodeColor={n => {
                                if (n.type === 'startNode') return '#18181b';
                                if (n.type === 'conditionNode') return '#3f3f46';
                                if (n.type === 'actionNode') {
                                    const actionKey = n.data?.action as string | undefined;
                                    return (ACTIONS[actionKey as keyof typeof ACTIONS] ?? ACTIONS.skip).color;
                                }
                                return '#a1a1aa';
                            }}
                            maskColor="rgba(255,255,255,0.6)"
                        />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}
