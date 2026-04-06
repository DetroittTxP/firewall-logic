import type { NodeTypes } from '@xyflow/react';
import { StartNode } from './StartNode';
import { ConditionNode } from './ConditionNode';
import { ActionNode } from './ActionNode';
import { EndNode } from './EndNode';

export const nodeTypes: NodeTypes = {
    startNode: StartNode,
    conditionNode: ConditionNode,
    actionNode: ActionNode,
    endNode: EndNode,
};
