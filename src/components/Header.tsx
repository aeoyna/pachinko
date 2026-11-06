import React from 'react';
import { ChevronLeft, Info } from 'lucide-react';

interface HeaderProps {
  title: string;
  icon?: string;
  roundCount: number;
  masteryPercentage: number;
  onOpenDetail: () => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  icon = '📙',
  roundCount,
  masteryPercentage,
  onOpenDetail,
  onBack,
}) => {
  return (
    <header className="app-header">
      <div className="header-top-row">
        {/* Back Button */}
        <button
          className="header-circle-btn"
          onClick={onBack}
          aria-label="戻る"
          title="戻る"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Title and Mastery (Moved beside Title!) */}
        <button
          className="header-title-btn"
          onClick={onOpenDetail}
          title="プロジェクトの詳細を表示"
        >
          <span className="title-icon">{icon}</span>
          <span className="title-text">{title}</span>
          <div className="mastery-pill">
            <span className="mastery-pill-label">習得</span>
            <span className="mastery-pill-val">{masteryPercentage}%</span>
          </div>
          <Info size={14} className="title-info-icon" />
        </button>

        {/* Round Counter (Enlarged in widened area!) */}
        <div className="header-round-area">
          <div className="round-large-display">
            <span className="round-number">{roundCount}</span>
            <span className="round-unit">回</span>
          </div>
        </div>
      </div>

      {/* Progress Bar under header */}
      <div className="header-progress-track" onClick={onOpenDetail} style={{ cursor: 'pointer' }}>
        <div
          className="header-progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, masteryPercentage))}%` }}
        />
      </div>
    </header>
  );
};
