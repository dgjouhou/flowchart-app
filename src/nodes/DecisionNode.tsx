import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import './Nodes.css';

export function DecisionNode({ id, data }: NodeProps) {
    const { updateNodeData, deleteElements } = useReactFlow();

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { label: evt.target.value });
    };

    const onDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    return (
        <div className="custom-node custom-node-decision group">
            <svg className="decision-shape" viewBox="0 0 175 70" preserveAspectRatio="none">
                <polygon points="87.5,0 175,35 87.5,70 0,35" stroke="#f59e0b" strokeWidth="2" fill="white" />
            </svg>

            {/* Input: Top Vertex */}
            <Handle type="target" position={Position.Top} style={{ top: 0, background: '#555' }} />

            <div className="custom-node-decision-content">
                <input
                    className="node-input decision-input"
                    value={data.label as string}
                    onChange={onChange}
                    placeholder="条件"
                />
            </div>

            <button className="node-delete-btn" onClick={onDelete}>×</button>
            <div className="node-help-btn">?</div>
            <div className="node-help-tooltip">例: x {'>'} 5</div>

            {/* True: Bottom Vertex */}
            <div className="decision-label-true">True</div>
            <Handle type="source" position={Position.Bottom} id="true" style={{ bottom: 0, background: '#555' }} />

            {/* False: Right Vertex */}
            <div className="decision-label-false">False</div>
            <Handle type="source" position={Position.Right} id="false" style={{ right: 0, background: '#555' }} />
        </div>
    );
}
