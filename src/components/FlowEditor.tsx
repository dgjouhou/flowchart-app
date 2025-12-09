import { useCallback, useRef, useState, useMemo } from 'react';
import {
    ReactFlow,
    addEdge,
    Controls,
    Background,
    type Connection,
    type Edge,
    type ReactFlowInstance,
    BackgroundVariant,
    type Node,
    type OnNodesChange,
    type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './FlowEditor.css';
import { ProcessNode } from '../nodes/ProcessNode';
import { DecisionNode } from '../nodes/DecisionNode';
import { InputOutputNode } from '../nodes/InputOutputNode';
import { StartEndNode } from '../nodes/StartEndNode';
import { LoopStartNode } from '../nodes/LoopStartNode';
import { LoopEndNode } from '../nodes/LoopEndNode';
import { PreparationNode } from '../nodes/PreparationNode';
import { PlaceholderNode } from '../nodes/PlaceholderNode';
import CustomEdge from './CustomEdge';

let id = 0;
const getId = () => `dndnode_${id++}`;

interface FlowEditorProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export const FlowEditor = ({ nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges }: FlowEditorProps) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);

    const nodeTypes = useMemo(() => ({
        process: ProcessNode,
        decision: DecisionNode,
        io: InputOutputNode,
        'start-end': StartEndNode,
        'loop-start': LoopStartNode,
        'loop-end': LoopEndNode,
        preparation: PreparationNode,
        placeholder: PlaceholderNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        'custom-edge': CustomEdge,
    }), []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'custom-edge' }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current || !reactFlowInstance) {
                return;
            }

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/reactflow-label');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: label },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    return (
        <div className="flow-editor-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};
