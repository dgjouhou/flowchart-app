import { type Edge, type Node } from '@xyflow/react';

export type VariableMap = Record<string, any>;

export interface ExecutionState {
    currentNodeId: string | null;
    variables: VariableMap;
    logs: string[];
    isFinished: boolean;
    error?: string;
    activeLoops: Record<string, boolean>; // nodeId -> isActive
}

export class FlowExecutor {
    private nodes: Node[];
    private edges: Edge[];
    private state: ExecutionState;

    constructor(nodes: Node[], edges: Edge[]) {
        this.nodes = nodes;
        this.edges = edges;
        this.state = {
            currentNodeId: null,
            variables: {},
            logs: [],
            isFinished: false,
            activeLoops: {},
        };
    }

    public start(): ExecutionState {
        // Find start node
        const startNode = this.nodes.find((n) => n.type === 'start-end' && n.data.label === '開始');
        if (!startNode) {
            return { ...this.state, error: '開始ノードが見つかりません' };
        }

        this.state.currentNodeId = startNode.id;
        this.state.logs.push('実行開始');
        return { ...this.state };
    }

    public step(): ExecutionState {
        if (this.state.isFinished || !this.state.currentNodeId) {
            return this.state;
        }

        const currentNode = this.nodes.find((n) => n.id === this.state.currentNodeId);
        if (!currentNode) {
            return { ...this.state, error: 'ノードが見つかりません', isFinished: true };
        }

        try {
            // Execute current node logic
            const executionResult = this.executeNode(currentNode);

            // Determine next node
            let nextNodeId: string | null = null;

            if (executionResult && executionResult.jumpToNodeId) {
                nextNodeId = executionResult.jumpToNodeId;
            } else {
                nextNodeId = this.getNextNodeId(currentNode);
            }

            if (nextNodeId) {
                this.state.currentNodeId = nextNodeId;
            } else {
                this.state.isFinished = true;
                this.state.logs.push('実行終了');
                this.state.currentNodeId = null;
            }

        } catch (e: any) {
            this.state.error = e.message;
            this.state.isFinished = true;
        }

        return { ...this.state };
    }

    private executeNode(node: Node): { jumpToNodeId?: string } | void {
        const label = node.data.label as string;

        switch (node.type) {
            case 'process':
            case 'preparation': // Treat preparation same as process
                this.executeProcess(label);
                break;
            case 'io':
                this.executeIO(label);
                break;
            case 'decision':
                // Decision logic is handled in getNextNodeId usually, 
                // but we might need to evaluate condition here to know which path to take
                break;
            case 'start-end':
                if (label === '終了') {
                    this.state.isFinished = true;
                }
                break;
            case 'loop-start':
                return this.executeLoopStart(node);
            case 'loop-end':
                return this.executeLoopEnd(node);
        }
    }

    private executeLoopStart(node: Node): { jumpToNodeId?: string } | void {
        // label format: "i, 0, 10" or "i, 0, 10, 1"
        const parts = (node.data.label as string).split(',').map(s => s.trim());
        const varName = parts[0];
        const startVal = this.evaluateExpression(parts[1]);
        const endVal = this.evaluateExpression(parts[2]);
        // const stepVal = parts[3] ? this.evaluateExpression(parts[3]) : 1; // Not used in start, used in end? Or start handles everything?
        // Usually Start handles Init and Check. End handles Increment.

        // Init if not active
        if (!this.state.activeLoops[node.id]) {
            this.state.variables[varName] = startVal;
            this.state.activeLoops[node.id] = true;
            this.state.logs.push(`ループ開始: ${varName} = ${startVal}`);
        }

        // Check condition
        const currentVal = this.state.variables[varName];
        if (currentVal <= endVal) {
            // Continue to body (next node)
            this.state.logs.push(`ループ条件(True): ${currentVal} <= ${endVal}`);
            return;
        } else {
            // Exit loop
            this.state.logs.push(`ループ条件(False): ${currentVal} > ${endVal}`);
            delete this.state.activeLoops[node.id];

            // Find paired LoopEnd
            // We assume LoopEnd has the same variable name? Or we search for a LoopEnd reachable?
            // Simplest: Search for LoopEnd with same varName.
            // Warning: Nested loops with same var name will break. But for learning app, maybe ok?
            // Better: User should use unique vars.
            const loopEnd = this.nodes.find(n => n.type === 'loop-end' && (n.data.label as string).trim() === varName);

            if (loopEnd) {
                // Jump to node AFTER LoopEnd
                const nextAfterEnd = this.getNextNodeId(loopEnd);
                if (nextAfterEnd) {
                    return { jumpToNodeId: nextAfterEnd };
                }
            }
            // If no loop end found or no next node, just finish?
            // Or maybe we just follow the "False" edge if it exists?
            // If we implement "Implicit Jump", we return jumpToNodeId.
        }
    }

    private executeLoopEnd(node: Node): { jumpToNodeId?: string } | void {
        const varName = (node.data.label as string).trim();

        // Increment
        // We need to know the step. Where is it stored? In LoopStart.
        // We need to find the paired LoopStart.
        const loopStart = this.nodes.find(n => {
            if (n.type !== 'loop-start') return false;
            const parts = (n.data.label as string).split(',');
            return parts[0].trim() === varName;
        });

        let step = 1;
        if (loopStart) {
            const parts = (loopStart.data.label as string).split(',').map(s => s.trim());
            if (parts[3]) {
                step = this.evaluateExpression(parts[3]);
            }
        }

        if (this.state.variables[varName] !== undefined) {
            this.state.variables[varName] += step;
            // this.state.logs.push(`ループ増分: ${varName} <- ${this.state.variables[varName]}`);
        }

        // Jump back to LoopStart
        if (loopStart) {
            return { jumpToNodeId: loopStart.id };
        }
    }

    private executeProcess(command: string) {
        // Simple assignment: x = 10 or x = x + 1
        if (command.includes('=')) {
            const [varName, expression] = command.split('=').map(s => s.trim());
            const value = this.evaluateExpression(expression);
            this.state.variables[varName] = value;
            this.state.logs.push(`処理: ${varName} <- ${value}`);
        }
    }

    private executeIO(command: string) {
        // Simple print: print x or just x
        // For now, just evaluate the content and log it
        // If it starts with "出力", remove it
        let expr = command;
        if (expr.startsWith('出力')) {
            expr = expr.replace('出力', '').trim();
        }

        // Check if it's a variable
        if (this.state.variables.hasOwnProperty(expr)) {
            this.state.logs.push(`出力: ${this.state.variables[expr]}`);
        } else {
            // Try to evaluate as expression or string
            try {
                const val = this.evaluateExpression(expr);
                this.state.logs.push(`出力: ${val}`);
            } catch {
                this.state.logs.push(`出力: ${expr}`);
            }
        }
    }

    private evaluateExpression(expression: string): any {
        // Very basic evaluation using Function constructor (safe-ish for local app, but risky in prod)
        // Replace variable names with values
        let evalExpr = expression;
        for (const [key, val] of Object.entries(this.state.variables)) {
            // Simple replace, might be buggy if var names are substrings of others
            // Better regex needed for robust implementation
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evalExpr = evalExpr.replace(regex, JSON.stringify(val));
        }

        try {
            // eslint-disable-next-line no-new-func
            return new Function(`return ${evalExpr}`)();
        } catch (e) {
            console.error('Eval error', e);
            return expression; // Return as string if eval fails
        }
    }

    private getNextNodeId(node: Node): string | null {
        const outgoingEdges = this.edges.filter((e) => e.source === node.id);

        if (outgoingEdges.length === 0) return null;

        if (node.type === 'decision') {
            const condition = node.data.label as string;
            const result = this.evaluateCondition(condition);
            this.state.logs.push(`条件分岐: ${condition} -> ${result ? 'True' : 'False'}`);

            // Find edge connected to correct handle (true/false)
            // Assuming handle id is 'true' or 'false'
            const targetEdge = outgoingEdges.find(e => e.sourceHandle === (result ? 'true' : 'false'));
            return targetEdge ? targetEdge.target : null;
        }

        // For other nodes, just take the first edge (should be only one)
        return outgoingEdges[0].target;
    }

    private evaluateCondition(condition: string): boolean {
        // Similar to evaluateExpression but returns boolean
        return !!this.evaluateExpression(condition);
    }

    public getState(): ExecutionState {
        return this.state;
    }
}
