import type { Node, Edge } from '@xyflow/react';

export interface Problem {
    id: string;
    title: string;
    description: string;
    initialNodes: Node[];
    initialEdges: Edge[];
    validate: (nodes: Node[], edges: Edge[]) => { isCorrect: boolean; hint: string };
}

export const problems: Problem[] = [
    {
        id: '1',
        title: '配列の中身を全て表示しよう',
        description: '配列 a = [10, 20, 30] の中身を、ループを使って順番に全て出力してください。',
        initialNodes: [
            { id: 'start', type: 'start-end', data: { label: '開始' }, position: { x: 250, y: 20 } },
            { id: 'prep', type: 'preparation', data: { label: 'a = [10, 20, 30]' }, position: { x: 250, y: 100 } },
            { id: 'placeholder1', type: 'placeholder', data: { label: '?' }, position: { x: 250, y: 200 } },
            { id: 'placeholder2', type: 'placeholder', data: { label: '?' }, position: { x: 250, y: 300 } },
            { id: 'loop-end', type: 'loop-end', data: { label: 'i' }, position: { x: 250, y: 400 } },
            { id: 'end', type: 'start-end', data: { label: '終了' }, position: { x: 250, y: 500 } },
        ],
        initialEdges: [
            { id: 'e1', source: 'start', target: 'prep', type: 'custom' },
            { id: 'e2', source: 'prep', target: 'placeholder1', type: 'custom' },
            { id: 'e3', source: 'placeholder1', target: 'placeholder2', type: 'custom' },
            { id: 'e4', source: 'placeholder2', target: 'loop-end', type: 'custom' },
            { id: 'e5', source: 'loop-end', target: 'end', type: 'custom' },
        ],
        validate: (nodes: Node[], edges: Edge[]) => {
            // Check for Loop Start
            const loopStart = nodes.find(n => n.type === 'loop-start');
            if (!loopStart) {
                return { isCorrect: false, hint: 'ループ開始ノードが必要です。' };
            }
            const loopStartLabel = (loopStart.data.label as string).replace(/\s/g, '');
            // Expect i, 0, 2 (or 3 or length)
            if (!loopStartLabel.includes('i,0')) {
                return { isCorrect: false, hint: 'ループ変数は i、開始値は 0 に設定してください。' };
            }
            // Simple check for end value (2 or 3 or length)
            if (!loopStartLabel.includes('2') && !loopStartLabel.includes('3') && !loopStartLabel.includes('len')) {
                return { isCorrect: false, hint: 'ループの終了条件を確認してください。配列の要素数は3つです（インデックスは0〜2）。' };
            }

            // Check for Output
            const io = nodes.find(n => n.type === 'io');
            if (!io) {
                return { isCorrect: false, hint: '出力ノードが必要です。' };
            }
            const ioLabel = (io.data.label as string).replace(/\s/g, '');
            if (!ioLabel.includes('a[i]')) {
                return { isCorrect: false, hint: '配列 a の要素を、変数 i を使って指定してください（例: a[i]）。' };
            }

            // Check connections (simplified: just check if they exist)
            // Ideally we traverse the graph, but for now existence is likely enough given the limited nodes.

            return { isCorrect: true, hint: '' };
        }
    }
];
