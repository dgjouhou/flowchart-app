import React from 'react';
import './ResultPanel.css';
import { type ExecutionState } from '../engine/Executor';

interface ResultPanelProps {
    state: ExecutionState | null;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ state }) => {
    if (!state) {
        return <div className="result-panel-empty">実行ボタンを押して開始してください</div>;
    }

    return (
        <div className="result-panel-container">
            <div className="panel-section">
                <h3>実行ログ</h3>
                <div className="logs-container">
                    {state.logs.map((log, index) => (
                        <div key={index} className="log-item">
                            {log}
                        </div>
                    ))}
                    {state.error && <div className="log-error">エラー: {state.error}</div>}
                    {state.isFinished && <div className="log-finished">実行完了</div>}
                </div>
            </div>

            <div className="panel-section">
                <h3>変数</h3>
                <div className="variables-container">
                    {Object.entries(state.variables).length === 0 ? (
                        <div className="no-variables">変数なし</div>
                    ) : (
                        <table className="variables-table">
                            <thead>
                                <tr>
                                    <th>名前</th>
                                    <th>値</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(state.variables).map(([key, value]) => (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{JSON.stringify(value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
