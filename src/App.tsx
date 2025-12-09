import { useState, useRef } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { FlowEditor } from './components/FlowEditor';
import { ResultPanel } from './components/ResultPanel';
import { FlowExecutor, type ExecutionState } from './engine/Executor';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start-end',
    data: { label: '開始' },
    position: { x: 250, y: 5 },
  },
];

import { problems } from './data/problems';

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [mode, setMode] = useState<'normal' | 'problem'>('normal');
  const [showSuccess, setShowSuccess] = useState(false);

  const executorRef = useRef<FlowExecutor | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRun = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const executor = new FlowExecutor(nodes, edges);
    executorRef.current = executor;
    let state = executor.start();
    setExecutionState(state);

    // Run loop with small delay for visualization
    const runLoop = () => {
      if (state.isFinished) {
        timerRef.current = null;
        return;
      }
      state = executor.step();
      setExecutionState({ ...state }); // Force update
      if (!state.isFinished) {
        timerRef.current = setTimeout(runLoop, 500); // 500ms delay per step
      } else {
        timerRef.current = null;
      }
    };

    timerRef.current = setTimeout(runLoop, 500);
  };

  const handleStop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (executorRef.current && executionState) {
      setExecutionState({ ...executionState, isFinished: true, logs: [...executionState.logs, '実行停止'] });
    }
  };

  const handleStep = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!executorRef.current || executionState?.isFinished) {
      const executor = new FlowExecutor(nodes, edges);
      executorRef.current = executor;
      const state = executor.start();
      setExecutionState(state);
    } else {
      const state = executorRef.current.step();
      setExecutionState({ ...state });
    }
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    executorRef.current = null;
    setExecutionState(null);
  };

  const handleClearCanvas = () => {
    if (window.confirm('現在のフローチャートをすべて消去して初期状態に戻しますか？\n（保存していない内容は失われます）')) {
      setNodes(initialNodes);
      setEdges([]);
      handleReset();
    }
  };

  const handleSave = () => {
    const flowData = {
      nodes,
      edges,
    };
    const jsonString = JSON.stringify(flowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowchart.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLoadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const flowData = JSON.parse(content);
        if (flowData.nodes && flowData.edges) {
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          handleReset(); // Reset execution state on load
        } else {
          alert('無効なファイル形式です。');
        }
      } catch (error) {
        console.error('Error loading file:', error);
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

  const toggleMode = () => {
    if (mode === 'normal') {
      // Switch to Problem Mode
      setMode('problem');
      // Load Problem 1
      const problem = problems[0];
      setNodes(problem.initialNodes);
      setEdges(problem.initialEdges);
      handleReset();
    } else {
      // Switch to Normal Mode
      if (window.confirm('通常モードに戻りますか？現在の作業内容は失われます。')) {
        setMode('normal');
        setNodes(initialNodes);
        setEdges([]);
        handleReset();
      }
    }
  };

  const handleCheckAnswer = () => {
    const problem = problems[0];
    const result = problem.validate(nodes, edges);
    if (result.isCorrect) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    } else {
      alert(`不正解...\nヒント: ${result.hint}`);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>フローチャート学習</h1>
          <div className="control-group file-controls">
            <button onClick={handleSave} className="control-btn save-btn" style={{ backgroundColor: '#0ea5e9' }}>保存</button>
            <button onClick={handleLoadClick} className="control-btn load-btn" style={{ backgroundColor: '#8b5cf6' }}>読み込み</button>
            <button onClick={handleClearCanvas} className="control-btn clear-btn" style={{ backgroundColor: '#f97316' }}>全消去</button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleLoadFile}
            />
          </div>
        </div>

        <div className="header-center">
          <button
            onClick={toggleMode}
            className={`mode-toggle-btn ${mode === 'problem' ? 'active' : ''}`}
          >
            {mode === 'normal' ? '問題を解くモードへ' : '通常モードへ戻る'}
          </button>
        </div>

        <div className="header-right">
          <div className="control-group execution-controls">
            {mode === 'problem' && (
              <button onClick={handleCheckAnswer} className="control-btn check-btn" style={{ backgroundColor: '#e11d48', marginRight: 10 }}>答え合わせ</button>
            )}
            <button onClick={handleRun} className="control-btn run-btn">実行</button>
            <button onClick={handleStep} className="control-btn step-btn">ステップ実行</button>
            <button onClick={handleStop} className="control-btn stop-btn" style={{ backgroundColor: '#ef4444' }}>停止</button>
            <button onClick={handleReset} className="control-btn reset-btn">リセット</button>
          </div>
        </div>
      </header>

      {mode === 'problem' && (
        <div className="problem-banner">
          <strong>第1問:</strong> 問題文は一時的に非表示
        </div>
      )}

      <main className="main-content">
        <aside className="left-pane">
          <Sidebar />
        </aside>
        <section className="center-pane">
          <ReactFlowProvider>
            <FlowEditor
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              setNodes={setNodes}
              setEdges={setEdges}
            />
          </ReactFlowProvider>
          {showSuccess && (
            <div className="success-overlay">
              <div className="success-circle"></div>
            </div>
          )}
        </section>
        <aside className="right-pane">
          <ResultPanel state={executionState} />
        </aside>
      </main>
    </div>
  );
}

export default App;
