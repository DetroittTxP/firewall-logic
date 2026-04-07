// Types for the dynamic firewall logic builder

export type ConditionField = 'src' | 'dest' | 'port';

export type ConditionMatch = 'exact' | 'contain' | 'any' | 'new';

export type ActionKey =
    | 'skip'
    | 'add_port'
    | 'add_number'
    | 'add_src'
    | 'add_dest'
    | 'create';

export interface ConditionHandle {
    id: string;
    label: string;
    color: string;
}

export interface ActionConfig {
    label: string;
    color: string;
}

// Node data shapes (without the injected updateNode callback)
export interface StartNodeBaseData {
    [key: string]: unknown;
}

export interface EndNodeBaseData {
    label?: string;
}

export interface ConditionNodeBaseData {
    field: ConditionField;
    match: ConditionMatch;
}

export interface ActionNodeBaseData {
    action: ActionKey;
}

// With injected updater
export type UpdateNodeFn = (id: string, patch: Record<string, unknown>) => void;

export interface ConditionNodeData extends ConditionNodeBaseData {
    updateNode: UpdateNodeFn;
}

export interface ActionNodeData extends ActionNodeBaseData {
    updateNode: UpdateNodeFn;
}

export interface PaletteItem {
    type: string;
    label: string;
    color: string;
    data: Record<string, unknown>;
}

export interface PaletteGroup {
    group: string;
    items: PaletteItem[];
}

export interface ProfileData {
    nodes: import('@xyflow/react').Node[];
    edges: import('@xyflow/react').Edge[];
}

export type ProfileMap = Record<string, ProfileData>;

export type ExportModalTab = 'readable' | 'pseudo' | 'yaml' | 'json';

export interface ExportResult {
    readable: string;
    pseudo: string;
    yaml: string;
    json: string;
}

// ─── Workflow runner ───────────────────────────────────────────────────────────
export interface WorkflowStep {
    type: 'start' | 'condition' | 'action' | 'end';
    label: string;
    color: string;
}

export type WorkflowPath = WorkflowStep[];
