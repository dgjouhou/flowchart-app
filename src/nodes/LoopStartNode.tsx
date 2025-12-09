import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import './Nodes.css';

export function LoopStartNode({ id, data }: NodeProps) {
  const { updateNodeData, deleteElements } = useReactFlow();

  const onChangeLabel = (evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { label: evt.target.value });
  };

  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className="custom-node custom-node-loop-start group">
      <div className="loop-shape loop-shape-start" />
      <Handle type="target" position={Position.Top} />
      <div className="loop-content" style={{ zIndex: 1 }}>
        <div className="loop-label">ループ開始</div>
        <input
          className="node-input loop-input"
          value={data.label as string}
          onChange={onChangeLabel}
          placeholder="i, 0, 10"
        />
      </div>
      <button className="node-delete-btn" onClick={onDelete}>×</button>
      <div className="node-help-btn">?</div>
      <div className="node-help-tooltip">例: i, 0, 10</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
