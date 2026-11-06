import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { StatusCounters } from './components/StatusCounters';
import { CardStack } from './components/CardStack';
import { ScoreAndUndo } from './components/ScoreAndUndo';
import { FooterControls } from './components/FooterControls';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { INITIAL_WORDS } from './data/words';
import type { FlashCard } from './types';
import './App.css';

export default function App() {
  const [cards, setCards] = useState<FlashCard[]>(INITIAL_WORDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundCount, setRoundCount] = useState(18); // 18回
  const [score, setScore] = useState(266782); // 266782
  const [slotNumber] = useState('946');
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const historyRef = useRef<number[]>([]);

  // Calculate counts & mastery
  const masteredCount = cards.filter((c) => c.status === 'mastered').length;
  const learningCount = cards.filter((c) => c.status === 'learning').length;
  
  // Calculate project mastery percentage (ensuring 11% baseline as shown in user's image)
  const totalCards = cards.length;
  const masteryPercentage = Math.round(
    cards.reduce((acc, c) => acc + c.masteryLevel, 0) / totalCards
  );

  // Sound Engine (Web Audio API for metronome / feedback)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClick = useCallback((freq = 880) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  }, []);

  // Metronome Timer when isPlaying is true
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = (60 / bpm) * 1000;
    const timer = setInterval(() => {
      setCurrentBeat((prev) => {
        const next = (prev + 1) % 2;
        playClick(next === 0 ? 880 : 440);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, bpm, playClick]);

  // Next Card
  const handleNext = useCallback(() => {
    historyRef.current.push(currentIndex);
    playClick(600);
    setCurrentIndex((prev) => {
      const next = (prev + 1) % cards.length;
      if (next === 0) {
        setRoundCount((r) => r + 1);
      }
      return next;
    });
    setScore((s) => s + 150);
  }, [cards.length, currentIndex, playClick]);

  // Prev / Undo Card
  const handlePrev = useCallback(() => {
    playClick(500);
    if (historyRef.current.length > 0) {
      const lastIdx = historyRef.current.pop()!;
      setCurrentIndex(lastIdx);
    } else {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
  }, [cards.length, playClick]);

  // Mark as Mastered
  const handleMarkMastered = useCallback(
    (id: number) => {
      playClick(1000);
      setCards((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: 'mastered', masteryLevel: 100, reviewCount: c.reviewCount + 1 }
            : c
        )
      );
      setScore((s) => s + 500);
    },
    [playClick]
  );

  // Toggle status from detail modal
  const handleToggleCardStatus = useCallback((id: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'mastered' ? 'learning' : 'mastered';
          return {
            ...c,
            status: nextStatus,
            masteryLevel: nextStatus === 'mastered' ? 100 : Math.max(20, c.masteryLevel - 30),
          };
        }
        return c;
      })
    );
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDetailOpen) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (cards[currentIndex]) {
          handleMarkMastered(cards[currentIndex].id);
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, currentIndex, cards, handleNext, handlePrev, handleMarkMastered]);

  return (
    <div className="pachinko-app-root">
      {/* Mobile Screen Container */}
      <div className="mobile-canvas-container">
        {/* Top Header */}
        <Header
          title="金フレ（金のフレーズ）"
          icon="📙"
          roundCount={roundCount}
          masteryPercentage={masteryPercentage}
          onOpenDetail={() => setIsDetailOpen(true)}
          onBack={() => {
            // Optional back action
          }}
        />

        {/* Status Counters (Learning / Slot Reel 946 READY / Mastered) */}
        <StatusCounters
          learningCount={learningCount}
          masteredCount={masteredCount}
          slotNumber={slotNumber}
          slotStatus="READY"
          onLearningClick={() => setIsDetailOpen(true)}
          onMasteredClick={() => setIsDetailOpen(true)}
        />

        {/* Main Flashcard Area with Stacked Peeks */}
        <main className="flashcard-main-area">
          <CardStack
            cards={cards}
            currentIndex={currentIndex}
            onNext={handleNext}
            onPrev={handlePrev}
            onMarkMastered={handleMarkMastered}
          />
        </main>

        {/* Score & Undo Controls */}
        <ScoreAndUndo score={score} onUndo={handlePrev} />

        {/* Footer Rhythm Controls (120 BPM, Play/Pause, Slider) */}
        <FooterControls
          bpm={bpm}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onBpmChange={setBpm}
          currentBeat={currentBeat}
        />
      </div>

      {/* Project Detail Modal with Gradient Circular Chart & All Cards List */}
      <ProjectDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="金フレ（金のフレーズ）"
        roundCount={roundCount}
        score={score}
        cards={cards}
        onToggleCardStatus={handleToggleCardStatus}
      />
    </div>
  );
}
