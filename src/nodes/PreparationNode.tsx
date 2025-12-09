import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import './Nodes.css';

export function PreparationNode({ id, data }: NodeProps) {
    const { updateNodeData, deleteElements } = useReactFlow();

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { label: evt.target.value });
    };

    const onDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    return (
        <div className="custom-node custom-node-preparation group">
            <div className="preparation-shape" />
            <Handle type="target" position={Position.Top} />
            <div className="preparation-content" style={{ zIndex: 1 }}>
                <div className="node-label-sm">準備</div>
                <input
                    className="node-input"
                    value={data.label as string}
                    onChange={onChange}
                    placeholder="配列 a = []"
                />
            </div>
            <button className="node-delete-btn" onClick={onDelete}>×</button>
            <div className="node-help-btn">?</div>
            <div className="node-help-tooltip">例: a = [1, 2, 3], count = 0</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}
