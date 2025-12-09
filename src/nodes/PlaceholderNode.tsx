import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import './Nodes.css';

export function PlaceholderNode({ id }: NodeProps) {
    const { deleteElements } = useReactFlow();

    const onDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    return (
        <div className="custom-node custom-node-placeholder group">
            <Handle type="target" position={Position.Top} />
            <div className="placeholder-content">
                ?
            </div>
            <button className="node-delete-btn" onClick={onDelete}>×</button>
            <div className="node-help-tooltip">ここを正しい記号に置き換えてください</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}
