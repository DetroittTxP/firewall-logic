import { ACTIONS, HANDLE_MAP } from '../constants';

export function buildLogic(nodes, edges) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const adj = {};
  edges.forEach(e => {
    (adj[e.source] ??= []).push({ handle: e.sourceHandle ?? null, targetId: e.target });
  });

  const startNode = nodes.find(n => n.type === 'startNode');
  if (!startNode) return { readable: '⚠ Add a Start node to the canvas first.', pseudo: '' };

  const rLines = [];
  const pLines = [];

  function tr(nodeId, depth, branchLabel) {
    if (depth > 30) return;
    const node = nodeMap[nodeId];
    if (!node) return;
    const pad = '  '.repeat(depth);
    const pfx = branchLabel ? `[${branchLabel}] ` : '';

    if (node.type === 'startNode') {
      rLines.push('▶  New firewall rule arrives');
      pLines.push('def handle_new_rule(rule, existing_rules):');
    } else if (node.type === 'conditionNode') {
      const f = (node.data.field ?? 'field').toUpperCase();
      rLines.push(`${pad}${pfx}Check ${f} against existing rules:`);
      if (branchLabel) pLines.push(`${pad}# ↳ reached when: ${branchLabel}`);
      pLines.push(`${pad}${f.toLowerCase()}_match = check_field(rule.${f.toLowerCase()}, existing_rules)`);
    } else if (node.type === 'actionNode') {
      const a = ACTIONS[node.data.action]?.label ?? node.data.action;
      rLines.push(`${pad}${pfx}⚡  Action → ${a}`);
      if (branchLabel) pLines.push(`${pad}# ↳ ${branchLabel}`);
      pLines.push(`${pad}${node.data.action}(rule)`);
    } else if (node.type === 'endNode') {
      rLines.push(`${pad}${pfx}🏁  Done`);
      pLines.push(`${pad}return`);
      return;
    }

    const children = adj[nodeId] ?? [];

    if (node.type === 'conditionNode') {
      const f = (node.data.field ?? 'field').toLowerCase();
      children.forEach(({ handle, targetId }, idx) => {
        const h = HANDLE_MAP[handle];
        const lbl = h?.label ?? handle ?? 'unknown';
        rLines.push(`${pad}  if ${f} is "${lbl}":`);
        pLines.push(`${pad}${idx === 0 ? 'if' : 'elif'} ${f}_match == "${handle}":`);
        tr(targetId, depth + 2, null);
      });
    } else {
      children.forEach(({ targetId }) => tr(targetId, depth, null));
    }
  }

  tr(startNode.id, 0, null);

  if (rLines.length <= 1)
    return { readable: '⚠ Canvas has a Start node but no connections. Connect fields and actions.', pseudo: '' };

  return { readable: rLines.join('\n'), pseudo: pLines.join('\n') };
}

export function buildYAML(nodes, edges) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const adj = {};
  edges.forEach(e => { (adj[e.source] ??= []).push({ handle: e.sourceHandle ?? null, targetId: e.target }); });

  const startNode = nodes.find(n => n.type === 'startNode');
  if (!startNode) return '# Add a Start node to the canvas first.';

  function nodeToYaml(nodeId, itemIndent) {
    const node = nodeMap[nodeId];
    if (!node) return [];
    const children = adj[nodeId] ?? [];
    const pad = ' '.repeat(itemIndent);
    const cont = ' '.repeat(itemIndent + 2);
    const result = [];
    if (node.type === 'conditionNode') {
      result.push(`${pad}- check: ${node.data.field ?? 'field'}`);
      children.forEach(({ handle, targetId }) => {
        result.push(`${cont}${handle ?? 'unknown'}:`);
        result.push(...nodeToYaml(targetId, itemIndent + 4));
      });
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
