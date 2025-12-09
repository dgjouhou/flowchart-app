import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import './Nodes.css';

export function InputOutputNode({ id, data }: NodeProps) {
    const { updateNodeData, deleteElements } = useReactFlow();

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { label: evt.target.value });
    };

    const onDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    return (
        <div className="custom-node custom-node-io group">
            <Handle type="target" position={Position.Top} />
            <div className="custom-node-io-content">
                <input
                    className="node-input"
                    value={data.label as string}
                    onChange={onChange}
                    placeholder="入出力"
                />
            </div>
            <button className="node-delete-btn" onClick={onDelete}>×</button>
            <div className="node-help-btn">?</div>
            <div className="node-help-tooltip">例: 出力 x</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}
