import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import './Nodes.css';

export function ProcessNode({ id, data }: NodeProps) {
    const { updateNodeData, deleteElements } = useReactFlow();

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { label: evt.target.value });
    };

    const onDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    return (
        <div className="custom-node custom-node-process group">
            <Handle type="target" position={Position.Top} />
            <input
                className="node-input"
                value={data.label as string}
                onChange={onChange}
                placeholder="処理を入力"
            />
            <button className="node-delete-btn" onClick={onDelete}>×</button>
            <div className="node-help-btn">?</div>
            <div className="node-help-tooltip">例: x = 10, x = x + 1</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}
