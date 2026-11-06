import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlashCard } from '../types';

interface CardStackProps {
  cards: FlashCard[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onMarkMastered: (id: number) => void;
}

export const CardStack: React.FC<CardStackProps> = ({
  cards,
  currentIndex,
  onNext,
  onPrev,
  onMarkMastered,
}) => {
  const [showEnglish, setShowEnglish] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (cards.length === 0) {
    return <div className="card-stack-empty">カードがありません</div>;
  }

  const currentCard = cards[currentIndex];
  const nextCard = cards[(currentIndex + 1) % cards.length];
  const peekCard = cards[(currentIndex + 2) % cards.length];

  const handleTap = () => {
    setShowEnglish((prev) => !prev);
  };

  const handleDragEnd = (_e: any, info: { offset: { x: number; y: number } }) => {
    const swipeThreshold = 50;
    if (info.offset.y < -swipeThreshold) {
      // Swipe Up -> Next
      setShowEnglish(false);
      onNext();
    } else if (info.offset.y > swipeThreshold) {
      // Swipe Down -> Prev
      setShowEnglish(false);
      onPrev();
    } else if (info.offset.x > swipeThreshold) {
      // Swipe Right -> Mark Mastered
      setShowEnglish(false);
      onMarkMastered(currentCard.id);
      onNext();
    }
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div className="card-stack-viewport">
      {/* 2nd peek card (deepest: affordable) */}
      {peekCard && (
        <div className="peek-card-layer peek-deep">
          <div className="peek-card-content">
            <span className="peek-word-label">{peekCard.word}</span>
          </div>
        </div>
      )}

      {/* 1st peek card (repair) */}
      {nextCard && (
        <div className="peek-card-layer peek-mid">
          <div className="peek-card-content">
            <span className="peek-word-label">{nextCard.word}</span>
          </div>
        </div>
      )}

      {/* Active front card */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentCard.id}
          className="active-card-container"
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.4}
          onDrag={(_e, info) => setDragOffset({ x: info.offset.x, y: info.offset.y })}
          onDragEnd={handleDragEnd}
          onClick={handleTap}
          style={{
            cursor: 'grab',
            rotate: dragOffset.x * 0.04,
          }}
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: -100 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          <div className={`main-flashcard ${showEnglish ? 'flipped' : ''}`}>
            {/* Front (Japanese or English based on toggle) */}
            <div className="card-body">
              {!showEnglish ? (
                <div className="card-japanese-mode">
                  <div className="card-main-text">{currentCard.definition}</div>
                  <div className="card-hint-sub">タップで英語を表示</div>
                </div>
              ) : (
                <div className="card-english-mode">
                  <div className="card-main-word">{currentCard.word}</div>
                  {currentCard.phonetic && (
                    <div className="card-phonetic">{currentCard.phonetic}</div>
                  )}
                  {currentCard.example && (
                    <div className="card-example">"{currentCard.example}"</div>
                  )}
                  <div className="card-hint-sub">タップで日本語を表示</div>
                </div>
              )}
            </div>

            {/* Status indicator on card */}
            <div className={`card-status-badge ${currentCard.status}`}>
              {currentCard.status === 'mastered' ? '覚えた' : '学習中'}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

