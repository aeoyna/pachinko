import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2, BookOpen, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import type { FlashCard } from '../types';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  roundCount: number;
  score: number;
  cards: FlashCard[];
  onToggleCardStatus: (id: number) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  roundCount,
  score,
  cards,
  onToggleCardStatus,
}) => {
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts & percentages
  const totalCards = cards.length;
  const masteredCount = cards.filter((c) => c.status === 'mastered').length;
  const learningCount = cards.filter((c) => c.status === 'learning').length;
  
  // Calculate project mastery percentage (matching the 11% or weighted mastery)
  const masteryPercentage = useMemo(() => {
    if (totalCards === 0) return 0;
    // Calculate average mastery level across all cards
    const totalLevel = cards.reduce((acc, c) => acc + (c.masteryLevel || (c.status === 'mastered' ? 100 : 0)), 0);
    const avg = Math.round(totalLevel / totalCards);
    // If rounded avg is close, ensure consistency with the user's 11%
    return avg > 0 ? avg : Math.round((masteredCount / totalCards) * 100);
  }, [cards, totalCards, masteredCount]);

  const masteredRatio = totalCards > 0 ? masteredCount / totalCards : 0;
  const learningRatio = totalCards > 0 ? learningCount / totalCards : 0;

  // Filtered cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'mastered' && card.status === 'mastered') ||
        (filter === 'learning' && card.status === 'learning');

      const matchesSearch =
        card.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.definition.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [cards, filter, searchQuery]);

  // SVG circular chart parameters
  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Mastered arc length and learning arc length
  const masteredStroke = circumference * masteredRatio;
  const learningStroke = circumference * learningRatio;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Modal Header */}
          <div className="modal-header">
            <div className="modal-header-title-box">
              <span className="modal-project-badge">PROJECT DETAIL</span>
              <h2 className="modal-project-title">
                <span className="project-icon">📙</span> {title}
              </h2>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="閉じる">
              <X size={20} />
            </button>
          </div>

          <div className="modal-scroll-body">
            {/* Top Quick Stats Grid */}
            <div className="modal-stats-grid">
              <div className="modal-stat-card">
                <div className="stat-icon-wrapper gold">
                  <RotateCcw size={18} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">周回数</span>
                  <span className="stat-value gold-text">{roundCount} <small>回</small></span>
                </div>
              </div>

              <div className="modal-stat-card">
                <div className="stat-icon-wrapper green">
                  <Trophy size={18} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">習得度</span>
                  <span className="stat-value green-text">{masteryPercentage}%</span>
                </div>
              </div>

              <div className="modal-stat-card">
                <div className="stat-icon-wrapper blue">
                  <BookOpen size={18} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">総カード数</span>
                  <span className="stat-value blue-text">{totalCards} <small>枚</small></span>
                </div>
              </div>

              <div className="modal-stat-card">
                <div className="stat-icon-wrapper cyan">
                  <Sparkles size={18} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">トータルスコア</span>
                  <span className="stat-value cyan-text">{score.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Gradient Circular Progress Chart Section */}
            <div className="chart-section-card">
              <div className="section-title-row">
                <h3 className="section-title">学習度バランス（円グラフ）</h3>
                <span className="section-subtitle">習得状況の内訳</span>
              </div>

              <div className="chart-and-legend-row">
                {/* SVG Circular Donut with rich gradients */}
                <div className="chart-svg-container">
                  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-chart-svg">
                    <defs>
                      {/* Gradient for Mastered (Emerald to Cyan) */}
                      <linearGradient id="masteredGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>

                      {/* Gradient for Learning (Purple to Rose Red) */}
                      <linearGradient id="learningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>

                      {/* Track Background Gradient */}
                      <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>

                      {/* Glow Filter */}
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.4" />
                      </filter>
                    </defs>

                    {/* Background Track Circle */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="url(#trackGrad)"
                      strokeWidth={strokeWidth}
                    />

                    {/* Learning Segment (Red/Pink Gradient) */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="url(#learningGrad)"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${learningStroke} ${circumference}`}
                      strokeDashoffset={-masteredStroke}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                      className="chart-circle-anim"
                    />

                    {/* Mastered Segment (Green/Cyan Gradient) */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="url(#masteredGrad)"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${masteredStroke} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                      filter="url(#glow)"
                      className="chart-circle-anim"
                    />
                  </svg>

                  {/* Donut Center Display */}
                  <div className="donut-center-info">
                    <span className="donut-mastery-number">{masteryPercentage}%</span>
                    <span className="donut-mastery-sub">総合習得度</span>
                  </div>
                </div>

                {/* Legend & Breakdown */}
                <div className="chart-legend-box">
                  <div className="legend-item mastered">
                    <div className="legend-bullet mastered-bullet" />
                    <div className="legend-details">
                      <div className="legend-title-line">
                        <span className="legend-name">覚えた (Mastered)</span>
                        <span className="legend-count green-text">{masteredCount} 枚</span>
                      </div>
                      <div className="legend-bar-wrap">
                        <div
                          className="legend-bar-fill mastered-fill"
                          style={{ width: `${Math.round(masteredRatio * 100)}%` }}
                        />
                      </div>
                      <span className="legend-percentage">{Math.round(masteredRatio * 100)}%</span>
                    </div>
                  </div>

                  <div className="legend-item learning">
                    <div className="legend-bullet learning-bullet" />
                    <div className="legend-details">
                      <div className="legend-title-line">
                        <span className="legend-name">学習中 (Learning)</span>
                        <span className="legend-count red-text">{learningCount} 枚</span>
                      </div>
                      <div className="legend-bar-wrap">
                        <div
                          className="legend-bar-fill learning-fill"
                          style={{ width: `${Math.round(learningRatio * 100)}%` }}
                        />
                      </div>
                      <span className="legend-percentage">{Math.round(learningRatio * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* All Cards List & Mastery Section */}
            <div className="card-list-section">
              <div className="section-title-row">
                <div>
                  <h3 className="section-title">全カード一覧と学習度</h3>
                  <span className="section-subtitle">
                    各単語のステータス・習得度（全 {totalCards} カード）
                  </span>
                </div>
              </div>

              {/* Search and Filters Bar */}
              <div className="list-controls-bar">
                <div className="search-box">
                  <Search size={15} className="search-icon" />
                  <input
                    type="text"
                    placeholder="単語や日本語訳で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
                      ×
                    </button>
                  )}
                </div>

                <div className="filter-tabs">
                  <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    すべて ({totalCards})
                  </button>
                  <button
                    className={`filter-tab tab-mastered ${filter === 'mastered' ? 'active' : ''}`}
                    onClick={() => setFilter('mastered')}
                  >
                    覚えた ({masteredCount})
                  </button>
                  <button
                    className={`filter-tab tab-learning ${filter === 'learning' ? 'active' : ''}`}
                    onClick={() => setFilter('learning')}
                  >
                    学習中 ({learningCount})
                  </button>
                </div>
              </div>

              {/* Cards Scrollable Table/List */}
              <div className="cards-table-container">
                {filteredCards.length === 0 ? (
                  <div className="no-cards-found">
                    <p>該当するカードが見つかりません</p>
                  </div>
                ) : (
                  <div className="cards-list">
                    {filteredCards.map((card, idx) => (
                      <div key={card.id} className={`card-list-item status-${card.status}`}>
                        {/* Number Index */}
                        <div className="card-item-index">#{idx + 1}</div>

                        {/* Word & Meaning */}
                        <div className="card-item-main">
                          <div className="card-item-word-line">
                            <span className="card-item-en">{card.word}</span>
                            {card.phonetic && (
                              <span className="card-item-phonetic">{card.phonetic}</span>
                            )}
                          </div>
                          <div className="card-item-ja">{card.definition}</div>
                          {card.example && (
                            <div className="card-item-example">"{card.example}"</div>
                          )}

                          {/* Individual Mastery Level Bar (Gradient) */}
                          <div className="card-mastery-meter">
                            <div className="meter-label-row">
                              <span className="meter-label">個別習得度: {card.masteryLevel}%</span>
                              <span className="meter-reviews">復習 {card.reviewCount} 回</span>
                            </div>
                            <div className="meter-bar-track">
                              <div
                                className={`meter-bar-fill ${card.status}`}
                                style={{ width: `${card.masteryLevel}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Status Toggle Button */}
                        <div className="card-item-action">
                          <button
                            type="button"
                            className={`status-toggle-btn ${card.status}`}
                            onClick={() => onToggleCardStatus(card.id)}
                            title={card.status === 'mastered' ? '学習中に戻す' : '覚えたにする'}
                          >
                            <CheckCircle2 size={16} />
                            <span>{card.status === 'mastered' ? '覚えた' : '学習中'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
