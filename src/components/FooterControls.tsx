import React from 'react';
import { Play, Pause } from 'lucide-react';

interface FooterControlsProps {
  bpm: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onBpmChange: (newBpm: number) => void;
  currentBeat?: number;
}

export const FooterControls: React.FC<FooterControlsProps> = ({
  bpm,
  isPlaying,
  onTogglePlay,
  onBpmChange,
  currentBeat = 0,
}) => {
  return (
    <footer className="app-footer-controls">
      {/* Play/Pause Button */}
      <button
        className={`footer-play-btn ${isPlaying ? 'playing' : ''}`}
        onClick={onTogglePlay}
        aria-label={isPlaying ? '一時停止' : '再生'}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>

      {/* Rhythm Indicator Dots */}
      <div className="beat-dots-container">
        <span className={`beat-dot ${isPlaying && currentBeat % 2 === 0 ? 'active' : ''}`} />
        <span className={`beat-dot ${isPlaying && currentBeat % 2 === 1 ? 'active' : ''}`} />
      </div>

      {/* BPM Slider */}
      <div className="slider-wrapper">
        <input
          type="range"
          min="60"
          max="180"
          step="1"
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="bpm-range-slider"
          aria-label="BPM スライダー"
        />
      </div>

      {/* BPM Value Text */}
      <div className="bpm-text-display">
        <span className="bpm-val">{bpm}</span>
        <span className="bpm-unit">BPM</span>
      </div>
    </footer>
  );
};

