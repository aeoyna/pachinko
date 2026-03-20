import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { Zap, Heart, ChevronUp, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { useRhythmEngine } from './hooks/useRhythmEngine';
import './index.css';

const WORDS = [
  { id: 1, word: 'persistence', definition: '粘り強さ' },
  { id: 2, word: 'innovation', definition: '革新' },
  { id: 3, word: 'vibrant', definition: '活気に満ちた' },
  { id: 4, word: 'subtle', definition: '微妙な' },
  { id: 5, word: 'resilient', definition: '回復力のある' },
  { id: 6, word: 'meticulous', definition: '細心の' },
  { id: 7, word: 'proactive', definition: '積極的な' },
  { id: 8, word: 'eloquent', definition: '雄弁な' },
];

// ── direction: 1 = swipe-up (next), -1 = swipe-down (prev) ──
const variants = {
  enter: (dir: number) => ({
    y: dir > 0 ? '110%' : '-110%',
    scale: 0.9,
    opacity: 0,
  }),
  center: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 350, damping: 32 },
  },
  exit: (dir: number) => ({
    y: dir > 0 ? '-110%' : '110%',
    scale: 0.9,
    opacity: 0,
    transition: { type: 'spring', stiffness: 350, damping: 32 },
  }),
};

interface WordCardProps {
  word: string;
  definition: string;
  isFlipped: boolean;
  direction: number;
  dragY: ReturnType<typeof useMotionValue>;
  onDragEnd: (info: any) => void;
  onTap: () => void;
}

function WordCard({ word, definition, isFlipped, direction, dragY, onDragEnd, onTap }: WordCardProps) {
  const rotateX = useTransform(dragY, [-200, 200], [12, -12]);
  const cardScale = useTransform(dragY, [-300, 0, 300], [0.95, 1, 0.95]);
  const cardOpacity = useTransform(dragY, [-300, -80, 0, 80, 300], [0.5, 1, 1, 1, 0.5]);

  return (
    <motion.div
      key={word}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        perspective: '1200px',
        y: dragY,
        scale: cardScale,
        opacity: cardOpacity,
      }}
      drag="y"
      dragConstraints={{ top: -60, bottom: 60 }}
      dragElastic={0.18}
      onDragEnd={onDragEnd}
      onClick={onTap}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* 3-D flip wrapper */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          rotateX,
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Front */}
        <div className="glass" style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: '32px', padding: '2.5rem',
          boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '300' }}>Master Level</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', textAlign: 'center' }}>{word}</div>
          <Heart size={28} style={{ position: 'absolute', top: '30px', right: '30px', color: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: '24px', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px', opacity: 0.5 }}>TAP TO FLIP</div>
        </div>

        {/* Back */}
        <div className="glass" style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: '32px', padding: '2.5rem',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 215, 0, 0) 100%)',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '300' }}>Definition</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-color)', textAlign: 'center' }}>{definition}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Peek card shown behind the active card
function PeekCard({ word, direction }: { word: string; direction: number }) {
  return (
    <motion.div
      initial={false}
      animate={{ y: direction > 0 ? '72%' : '-72%', scale: 0.88, opacity: 0.35 }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <div className="glass" style={{
        width: '100%', height: '100%', borderRadius: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.5)',
      }}>
        {word}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [bpm, setBpm] = useState(60);
  const [wordIndex, setWordIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [combo, setCombo] = useState(0);
  const [stocks, setStocks] = useState(0);
  const [isRush, setIsRush] = useState(false);
  const [rushTime, setRushTime] = useState(0);
  const [games] = useState(100);
  const [souls, setSouls] = useState<{ id: number; target: 'hen' | 'right' }[]>([]);
  const [isLotteryRunning, setIsLotteryRunning] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<string | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  const dragY = useMotionValue(0);
  const { lastBeatTime, startEngine, playSlide, playRotation } = useRhythmEngine(bpm);

  useEffect(() => {
    if (isRush && rushTime > 0) {
      const timer = setInterval(() => setRushTime(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (isRush && rushTime <= 0) {
      setIsRush(false);
    }
  }, [isRush, rushTime]);

  const validateRhythm = useCallback(() => {
    const now = Date.now();
    const interval = (60 / bpm / 2) * 1000;
    return Math.abs(now - lastBeatTime) < interval * 0.4;
  }, [bpm, lastBeatTime]);

  const lotteryRef = useRef(false);

  const triggerLottery = useCallback(() => {
    if (lotteryRef.current) return;
    lotteryRef.current = true;
    setIsLotteryRunning(true);
    setLotteryResult(null);
    setTimeout(() => {
      let winProb = 1 / 99;
      if (combo >= 300) winProb = 1 / 89;
      else if (combo >= 100) winProb = 1 / 95;
      if (Math.random() < winProb) {
        setLotteryResult('777');
        setTimeout(() => { setIsRush(true); setRushTime(99); }, 1000);
      } else {
        setLotteryResult('MISS');
      }
      setIsLotteryRunning(false);
      setStocks(s => Math.max(s - 1, 0));
      lotteryRef.current = false;
    }, 1500);
  }, [combo]);

  const handleHesoLottery = useCallback((onBeat: boolean) => {
    if (Math.random() < (onBeat ? 1 / 5 : 1 / 6)) {
      setSouls(prev => [...prev, { id: Date.now(), target: 'hen' }]);
      setTimeout(() => {
        setStocks(s => Math.min(s + 1, 4));
        triggerLottery();
      }, 800);
    }
  }, [triggerLottery]);

  const goToNext = useCallback(() => {
    const onBeat = validateRhythm();
    setDirection(1);
    setWordIndex(prev => (prev + 1) % WORDS.length);
    setIsFlipped(false);
    playSlide();
    if (onBeat) {
      setCombo(c => c + 1);
      handleHesoLottery(true);
      if (isRush) setRushTime(t => t + 20);
    } else {
      setCombo(0);
      handleHesoLottery(false);
    }
  }, [validateRhythm, playSlide, handleHesoLottery, isRush]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setWordIndex(prev => (prev - 1 + WORDS.length) % WORDS.length);
    setIsFlipped(false);
    setCombo(0);
    playSlide();
  }, [playSlide]);

  const handleDragEnd = useCallback((_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    const threshold = 60;
    const velThreshold = 300;
    const { offset, velocity } = info;
    if (offset.y < -threshold || velocity.y < -velThreshold) {
      goToNext();
    } else if (offset.y > threshold || velocity.y > velThreshold) {
      goToPrev();
    }
    dragY.set(0);
  }, [goToNext, goToPrev, dragY]);

  const handleTap = useCallback(() => {
    setIsFlipped(f => !f);
    playRotation();
  }, [playRotation]);

  const handleSwipeRight = useCallback(() => {
    playRotation();
    setSouls(prev => [...prev, { id: Date.now(), target: 'right' }]);
  }, [playRotation]);

  const peekIndex = (wordIndex + (direction > 0 ? 1 : -1) + WORDS.length) % WORDS.length;

  // bind swipe-right via the outer container only
  const bind = useGesture({
    onDragEnd: ({ direction: [dx], velocity: [vx] }) => {
      if (vx > 0.3 && dx > 0) handleSwipeRight();
    }
  });

  return (
    <div className="app-container" style={{ userSelect: 'none', touchAction: 'none' }}>
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 60 / bpm, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', pointerEvents: 'none' }}
      />

      {/* Header */}
      <header className="glass" style={{ height: '140px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(4)].map((_, i) => (
              <motion.div key={i}
                animate={{ scale: i < stocks ? [1, 1.3, 1] : 1 }}
                style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: i < stocks ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                  boxShadow: i < stocks ? '0 0 15px var(--accent-color)' : 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                {i < stocks && <img src="/assets/images/egg.png" style={{ width: '120%', height: '120%', objectFit: 'contain' }} alt="egg" />}
              </motion.div>
            ))}
          </div>
          <div className="glass" style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-color)' }}>{games}G</div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <motion.div animate={{ y: [0, -8, 0], scale: isLotteryRunning ? [1, 1.1, 1] : 1 }} transition={{ repeat: Infinity, duration: 1 }}
            style={{ width: '70px', height: '70px', position: 'absolute', top: '-15px', zIndex: 5 }}>
            <img src="/assets/images/hen.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="hen" />
          </motion.div>
          <div style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '10px', color: isRush ? 'var(--accent-color)' : 'white', filter: isLotteryRunning ? 'blur(3px)' : 'none' }}>
            {isLotteryRunning ? '? ? ?' : (isRush ? (rushTime < 10 ? `0${rushTime}` : rushTime) : '7 7 7')}
          </div>
          {lotteryResult && !isLotteryRunning && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.4 }}
              style={{ position: 'absolute', color: lotteryResult === '777' ? 'var(--accent-color)' : 'white', fontWeight: '900', fontSize: '1.2rem', top: '10px' }}>
              {lotteryResult}
            </motion.div>
          )}
        </div>
      </header>

      {/* Main card area */}
      <main {...bind()} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden' }}>
        {/* Rhythm ring */}
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 60 / bpm / 2, repeat: Infinity }}
          style={{ position: 'absolute', width: '350px', height: '350px', border: '2px solid var(--accent-glow)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Combo */}
        <AnimatePresence>
          {combo > 0 && (
            <motion.div key={combo} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              style={{ position: 'absolute', top: '30px', left: '30px', color: 'var(--accent-color)', fontWeight: '900', fontSize: '1.5rem', fontStyle: 'italic', textShadow: '0 0 15px var(--accent-glow)', zIndex: 30 }}>
              {combo} COMBO
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card stack container */}
        <div style={{ width: '100%', maxWidth: '330px', height: '440px', position: 'relative' }}>
          {/* Peek card (behind) */}
          <PeekCard word={WORDS[peekIndex].word} direction={direction} />

          {/* Active card */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <WordCard
              key={wordIndex}
              word={WORDS[wordIndex].word}
              definition={WORDS[wordIndex].definition}
              isFlipped={isFlipped}
              direction={direction}
              dragY={dragY}
              onDragEnd={handleDragEnd}
              onTap={handleTap}
            />
          </AnimatePresence>
        </div>

        {/* Soul Particles */}
        <AnimatePresence>
          {souls.map(soul => (
            <motion.div key={soul.id}
              initial={{ scale: 0.5, opacity: 1, x: 0, y: 0 }}
              animate={{ scale: [1, 1.5, 0.5], opacity: [1, 0.8, 0], y: soul.target === 'hen' ? -450 : -50, x: soul.target === 'right' ? 350 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              onAnimationComplete={() => setSouls(prev => prev.filter(s => s.id !== soul.id))}
              style={{ position: 'absolute', color: 'var(--accent-color)', zIndex: 100 }}>
              <Zap fill="currentColor" size={40} className="glow" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Gesture hints */}
        <div style={{ position: 'absolute', bottom: '15px', width: '100%', display: 'flex', justifyContent: 'space-around', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronUp size={14} /> NEXT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronDown size={14} /> PREV</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronRight size={14} /> MEMORIZE</div>
        </div>
      </main>

      {/* Footer BPM */}
      <footer className="glass" style={{ height: '100px', padding: '0 2.5rem', display: 'flex', alignItems: 'center', gap: '2rem', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ flex: 1 }}>
          <input type="range" min="50" max="60" value={bpm}
            onChange={e => setBpm(parseInt(e.target.value))}
            style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', accentColor: 'var(--accent-color)', cursor: 'pointer' }} />
        </div>
        <div style={{ minWidth: '90px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>RHYTHM</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-color)' }}>{bpm} BPM</div>
        </div>
      </footer>

      {/* Start Overlay */}
      {!audioStarted && (
        <div onClick={() => { startEngine(); setAudioStarted(true); }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <Play size={80} fill="var(--accent-color)" color="var(--accent-color)" />
          </motion.div>
          <div style={{ marginTop: '2rem', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '2px' }}>TAP TO START SESSION</div>
        </div>
      )}

      {/* Rush Overlay */}
      <AnimatePresence>
        {isRush && rushTime > 95 && (
          <motion.div initial={{ scale: 0, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 2, opacity: 0 }}
            style={{ position: 'absolute', top: '35%', left: '5%', right: '5%', zIndex: 150, background: 'linear-gradient(45deg, #ffd700, #ff8c00)', color: 'black', padding: '3rem 1rem', borderRadius: '30px', textAlign: 'center', boxShadow: '0 0 50px var(--accent-glow)', fontWeight: '900', fontSize: '3.5rem' }}>
            FEVER RUSH!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
