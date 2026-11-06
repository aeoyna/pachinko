import React from 'react';

interface StatusCountersProps {
  learningCount: number;
  masteredCount: number;
  slotNumber: string;
  slotStatus?: string;
  onLearningClick?: () => void;
  onMasteredClick?: () => void;
}

export const StatusCounters: React.FC<StatusCountersProps> = ({
  learningCount,
  masteredCount,
  slotNumber = '946',
  slotStatus = 'READY',
  onLearningClick,
  onMasteredClick,
}) => {
  const digits = slotNumber.padStart(3, '0').split('');

  return (
    <div className="status-counters-row">
      {/* Learning Count (Red/Coral) */}
      <button
        type="button"
        className="counter-card counter-learning"
        onClick={onLearningClick}
        title="学習中のカード"
      >
        <span className="counter-val">{learningCount}</span>
        <span className="counter-label">学習中</span>
      </button>

      {/* Center Slot Reels */}
      <div className="slot-reel-box">
        <div className="slot-digits">
          {digits.map((digit, idx) => (
            <div key={idx} className="slot-digit-cell">
              {digit}
            </div>
          ))}
        </div>
        <div className="slot-status-text">{slotStatus}</div>
      </div>

      {/* Mastered Count (Green) */}
      <button
        type="button"
        className="counter-card counter-mastered"
        onClick={onMasteredClick}
        title="覚えたカード"
      >
        <span className="counter-val">{masteredCount}</span>
        <span className="counter-label">覚えた</span>
      </button>
    </div>
  );
};

