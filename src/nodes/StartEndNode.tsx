import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import './Nodes.css';

export function StartEndNode({ id, data }: NodeProps) {
    const { updateNodeData, deleteElements } = useReactFlow();

    // typeがinputならソースのみ、outputならターゲットのみ、など調整可能だが
    // ここでは汎用的に上下につけるか、dataで制御するか。
    // 一旦、開始は下のみ、終了は上のみとするロジックを入れるか、
    // 単純に上下につけておく。

    // labelが"開始"なら下のみ、"終了"なら上のみ、という簡易ロジック
    const isStart = (data.label as string).includes('開始');
    const isEnd = (data.label as string).includes('終了');

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { label: evt.target.value });
    };

    const onDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    return (
        <div className="custom-node custom-node-start-end group">
            {!isStart && <Handle type="target" position={Position.Top} />}
            <input
                className="node-input"
                value={data.label as string}
                onChange={onChange}
                style={{ width: '60px', textAlign: 'center' }}
            />
            {/* 開始ノードは削除できないようにする、あるいは終了ノードのみ削除可能にするなどの制御も可能だが、一旦全て削除可能に */}
            {!isStart && <button className="node-delete-btn" onClick={onDelete}>×</button>}
            {!isEnd && <Handle type="source" position={Position.Bottom} />}
        </div>
    );
}
