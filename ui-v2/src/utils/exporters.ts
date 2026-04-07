import type { Node, Edge } from '@xyflow/react';
import { ACTIONS, HANDLE_MAP } from '@/constants';
import type { ExportResult, WorkflowPath, WorkflowStep } from '@/types';

type AdjEntry = { handle: string | null; targetId: string };
type AdjMap = Record<string, AdjEntry[]>;

export function buildLogic(nodes: Node[], edges: Edge[]): ExportResult {
    const nodeMap: Record<string, Node> = Object.fromEntries(nodes.map(n => [n.id, n]));

    const adj: AdjMap = {};
    edges.forEach(e => {
        (adj[e.source] ??= []).push({ handle: e.sourceHandle ?? null, targetId: e.target });
    });

    const startNode = nodes.find(n => n.type === 'startNode');
    if (!startNode) {
        return {
            readable: '⚠ Add a Start node to the canvas first.',
            pseudo: '',
            yaml: '# Add a Start node to the canvas first.',
            json: '// Add a Start node to the canvas first.',
        };
    }

    const rLines: string[] = [];
    const pLines: string[] = [];

    function tr(nodeId: string, depth: number, branchLabel: string | null): void {
        if (depth > 30) return;
        const node = nodeMap[nodeId];
        if (!node) return;
        const pad = '  '.repeat(depth);
        const pfx = branchLabel ? `[${branchLabel}] ` : '';

        if (node.type === 'startNode') {
            rLines.push('▶  New firewall rule arrives');
            pLines.push('def handle_new_rule(rule, existing_rules):');
        } else if (node.type === 'conditionNode') {
            const f = ((node.data.field as string) ?? 'src').toLowerCase();
            const m = (node.data.match as string) ?? 'exact';
            rLines.push(`${pad}${pfx}if ${f} is "${m}":`);
            if (branchLabel) pLines.push(`${pad}# ↳ reached when: ${branchLabel}`);
            pLines.push(`${pad}if check_field(rule.${f}, existing_rules) == "${m}":`);
        } else if (node.type === 'actionNode') {
            const actionKey = node.data.action as string;
            const a = ACTIONS[actionKey as keyof typeof ACTIONS]?.label ?? actionKey;
            rLines.push(`${pad}${pfx}⚡  Action → ${a}`);
            if (branchLabel) pLines.push(`${pad}# ↳ ${branchLabel}`);
            pLines.push(`${pad}${actionKey}(rule)`);
        } else if (node.type === 'endNode') {
            rLines.push(`${pad}${pfx}🏁  Done`);
            pLines.push(`${pad}return`);
            return;
        }

        const children = adj[nodeId] ?? [];

        if (node.type === 'conditionNode') {
            children.forEach(({ targetId }) => tr(targetId, depth + 1, null));
        } else {
            children.forEach(({ targetId }) => tr(targetId, depth, null));
        }
    }

    tr(startNode.id, 0, null);

    if (rLines.length <= 1) {
        return {
            readable: '⚠ Canvas has a Start node but no connections. Connect fields and actions.',
            pseudo: '',
            yaml: '# No connected flow to export.',
            json: '// No connected flow to export.',
        };
    }

    return {
        readable: rLines.join('\n'),
        pseudo: pLines.join('\n'),
        yaml: buildYAML(nodes, edges),
        json: buildJSON(nodes, edges),
    };
}

export function buildYAML(nodes: Node[], edges: Edge[]): string {
    const nodeMap: Record<string, Node> = Object.fromEntries(nodes.map(n => [n.id, n]));
    const adj: AdjMap = {};
    edges.forEach(e => {
        (adj[e.source] ??= []).push({ handle: e.sourceHandle ?? null, targetId: e.target });
    });

    const startNode = nodes.find(n => n.type === 'startNode');
    if (!startNode) return '# Add a Start node to the canvas first.';

    function nodeToYaml(nodeId: string, itemIndent: number): string[] {
        const node = nodeMap[nodeId];
        if (!node) return [];
        const children = adj[nodeId] ?? [];
        const pad = ' '.repeat(itemIndent);
        const cont = ' '.repeat(itemIndent + 2);
        const result: string[] = [];

        if (node.type === 'conditionNode') {
            const field = (node.data.field as string) ?? 'field';
            const match = (node.data.match as string) ?? 'exact';
            result.push(`${pad}- check: ${field}`);
            result.push(`${cont}match: ${match}`);
            if (children.length > 0) {
                result.push(`${cont}then:`);
                children.forEach(({ targetId }) => {
                    result.push(...nodeToYaml(targetId, itemIndent + 4));
                });
            }
        } else if (node.type === 'actionNode') {
            result.push(`${pad}- action: ${node.data.action}`);
            children.forEach(({ targetId }) => result.push(...nodeToYaml(targetId, itemIndent)));
        } else if (node.type === 'endNode') {
            result.push(`${pad}- done: true`);
        }
        return result;
    }

    const startChildren = adj[startNode.id] ?? [];
    if (!startChildren.length) return '# No connected flow to export.';

    const lines = ['firewall_logic:', '  trigger: new_rule_arrives', '  flow:'];
    startChildren.forEach(({ targetId }) => lines.push(...nodeToYaml(targetId, 4)));
    return lines.join('\n');
}

export function buildJSON(nodes: Node[], edges: Edge[]): string {
    const nodeMap: Record<string, Node> = Object.fromEntries(nodes.map(n => [n.id, n]));
    const adj: AdjMap = {};
    edges.forEach(e => {
        (adj[e.source] ??= []).push({ handle: e.sourceHandle ?? null, targetId: e.target });
    });

    const startNode = nodes.find(n => n.type === 'startNode');
    if (!startNode) return '// Add a Start node to the canvas first.';

    function nodeToObj(nodeId: string): unknown {
        const node = nodeMap[nodeId];
        if (!node) return null;
        const children = adj[nodeId] ?? [];

        if (node.type === 'conditionNode') {
            const field = (node.data.field as string) ?? 'field';
            const match = (node.data.match as string) ?? 'exact';
            if (children.length === 0) return { check: field, match };
            const thenVal = children.length === 1
                ? nodeToObj(children[0].targetId)
                : children.map(c => nodeToObj(c.targetId));
            return { check: field, match, then: thenVal };
        } else if (node.type === 'actionNode') {
            const action = node.data.action as string;
            const next = children[0] ? nodeToObj(children[0].targetId) : null;
            return next ? { action, next } : { action };
        } else if (node.type === 'endNode') {
            return { done: true };
        }
        return null;
    }

    const startChildren = adj[startNode.id] ?? [];
    if (!startChildren.length) return '// No connected flow to export.';

    const flow = startChildren.length === 1
        ? nodeToObj(startChildren[0].targetId)
        : startChildren.map(({ targetId }) => nodeToObj(targetId));

    const result = {
        trigger: 'new_rule_arrives',
        flow,
    };

    return JSON.stringify(result, null, 2);
}

// ─── Workflow runner ──────────────────────────────────────────────────────────
// Enumerates all paths from Start → End as flat step arrays.

export function buildWorkflowPaths(nodes: Node[], edges: Edge[]): WorkflowPath[] {
    const nodeMap: Record<string, Node> = Object.fromEntries(nodes.map(n => [n.id, n]));
    const adj: AdjMap = {};
    edges.forEach(e => {
        (adj[e.source] ??= []).push({ handle: e.sourceHandle ?? null, targetId: e.target });
    });

    const startNode = nodes.find(n => n.type === 'startNode');
    if (!startNode) return [];

    const paths: WorkflowPath[] = [];

    function dfs(nodeId: string, current: WorkflowStep[], visited: Set<string>): void {
        if (visited.has(nodeId)) return;
        const node = nodeMap[nodeId];
        if (!node) return;

        let step: WorkflowStep;

        if (node.type === 'startNode') {
            step = { type: 'start', label: '▶  Start', color: '#18181b' };
        } else if (node.type === 'conditionNode') {
            const f = (node.data.field as string) ?? 'src';
            const m = (node.data.match as string) ?? 'exact';
            const color = HANDLE_MAP[m]?.color ?? '#3f3f46';
            step = { type: 'condition', label: `if ${f} is "${m}"`, color };
        } else if (node.type === 'actionNode') {
            const actionKey = node.data.action as string;
            const a = ACTIONS[actionKey as keyof typeof ACTIONS];
            step = { type: 'action', label: a?.label ?? actionKey, color: a?.color ?? '#3f3f46' };
        } else if (node.type === 'endNode') {
            step = { type: 'end', label: '🏁  Done', color: '#71717a' };
            paths.push([...current, step]);
            return;
        } else {
            return;
        }

        const children = adj[nodeId] ?? [];
        if (children.length === 0) {
            paths.push([...current, step]);
            return;
        }

        const nextVisited = new Set(visited);
        nextVisited.add(nodeId);
        children.forEach(({ targetId }) => dfs(targetId, [...current, step], nextVisited));
    }

    dfs(startNode.id, [], new Set());
    return paths;
}
