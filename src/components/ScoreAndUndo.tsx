import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ScoreAndUndoProps {
  score: number;
  onUndo: () => void;
}

export const ScoreAndUndo: React.FC<ScoreAndUndoProps> = ({ score, onUndo }) => {
  return (
    <div className="score-undo-row">
      {/* Undo/Reverse Button */}
      <button
        className="undo-circle-btn"
        onClick={onUndo}
        aria-label="戻す / 前のカードへ"
        title="前のカードに戻る"
      >
        <RotateCcw size={20} />
      </button>

      {/* Score Counter */}
      <div className="score-display-box">
        <div className="score-digits">{score.toLocaleString()}</div>
        <div className="score-sub-label">SCORE</div>
      </div>
    </div>
  );
};

