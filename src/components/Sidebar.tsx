import React from 'react';
import './Sidebar.css';

export const Sidebar = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow-label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-title">部品パレット</div>
            <div className="sidebar-description">ドラッグして追加</div>

            <div className="node-category">基本</div>
            <div className="dnd-node input-node" onDragStart={(event) => onDragStart(event, 'start-end', '開始')} draggable>
                開始
            </div>
            <div className="dnd-node input-node" onDragStart={(event) => onDragStart(event, 'start-end', '終了')} draggable>
                終了
            </div>
            <div className="dnd-node default-node" onDragStart={(event) => onDragStart(event, 'process', '処理')} draggable>
                処理
            </div>
            <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'decision', '条件')} draggable>
                条件分岐
            </div>
            <div className="dnd-node input-output" onDragStart={(event) => onDragStart(event, 'io', '出力 x')} draggable>
                入出力
            </div>
            <div className="dnd-node preparation" onDragStart={(event) => onDragStart(event, 'preparation', 'a = []')} draggable style={{ borderColor: '#d97706', color: '#d97706' }}>
                準備
            </div>
            <div className="dnd-node loop-start" onDragStart={(event) => onDragStart(event, 'loop-start', 'i, 0, 10')} draggable>
                ループ開始
            </div>
            <div className="dnd-node" onDragStart={(event) => onDragStart(event, 'loop-end', 'i')} draggable>
                ループ終了
            </div>
        </div>
    );
};
