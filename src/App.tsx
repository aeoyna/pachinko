import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { Zap, Heart, ChevronUp, ChevronDown, ChevronRight, Play, Pause } from 'lucide-react';
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

function WordCard({ word, definition, isFlipped, onFlip }: { word: string; definition: string; isFlipped: boolean; onFlip: () => void }) {
  return (
    <motion.div
      className="card-content"
      style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onFlip}
    >
      {/* Front */}
      <div className="glass" style={{
        position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        borderRadius: '32px', padding: '2.5rem', boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '300' }}>Master Level</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', textAlign: 'center' }}>{word}</div>
        <Heart size={28} style={{ position: 'absolute', top: '30px', right: '30px', color: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* Back */}
      <div className="glass" style={{
        position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        borderRadius: '32px', padding: '2.5rem', transform: 'rotateY(180deg)',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 100%)'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '300' }}>Definition</div>
        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-color)', textAlign: 'center' }}>{definition}</div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [bpm, setBpm] = useState(60);
  const [wordIndex, setWordIndex] = useState(0);
  const [flipStates, setFlipStates] = useState<Record<number, boolean>>({});
  const [combo, setCombo] = useState(0);
  const [stocks, setStocks] = useState(0);
  const [isRush, setIsRush] = useState(false);
  const [rushTime, setRushTime] = useState(0);
  const [games] = useState(100);
  const [souls, setSouls] = useState<{ id: number; x: number; y: number; target: 'hen' | 'right' }[]>([]);
  const [isLotteryRunning, setIsLotteryRunning] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<string | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [direction, setDirection] = useState(0);

  const dragY = useMotionValue(0);
  const dragX = useMotionValue(0);
  const springY = useSpring(dragY, { stiffness: 400, damping: 40 });
  const springX = useSpring(dragX, { stiffness: 400, damping: 40 });

  const rotateX = useTransform(springY, [-300, 300], [20, -20]);
  const rotateY = useTransform(springX, [-300, 300], [-20, 20]);

  const { lastBeatTime, isPlaying, startEngine, stopEngine, playSlide, playRotation } = useRhythmEngine(bpm);

  useEffect(() => {
    if (isRush && rushTime > 0) {
      const timer = setInterval(() => {
        setRushTime(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (isRush && rushTime <= 0) {
      setIsRush(false);
    }
  }, [isRush, rushTime]);

  const validateRhythm = useCallback(() => {
    const now = Date.now();
    const interval = (60 / bpm / 2) * 1000;
    const diff = Math.abs(now - lastBeatTime);
    const window = interval * 0.4;
    return diff < window;
  }, [bpm, lastBeatTime]);

  const toggleFlip = useCallback((index: number) => {
    setFlipStates(prev => ({ ...prev, [index]: !prev[index] }));
    playRotation();
  }, [playRotation]);

  const handleHesoLottery = (onBeat: boolean) => {
    const prob = onBeat ? 1 / 5 : 1 / 6;
    if (Math.random() < prob) {
      setSouls(prev => [...prev, { id: Date.now(), x: 0, y: 0, target: 'hen' }]);
      setTimeout(() => {
        setStocks(s => Math.min(s + 1, 4));
        triggerLottery();
      }, 800);
    }
  };

  const triggerLottery = () => {
    if (isLotteryRunning) return;
    setIsLotteryRunning(true);
    setLotteryResult(null);

    setTimeout(() => {
      let winProb = 1 / 99;
      if (combo >= 300) winProb = 1 / 89;
      else if (combo >= 100) winProb = 1 / 95;

      if (Math.random() < winProb) {
        setLotteryResult('777');
        setTimeout(() => {
          setIsRush(true);
          setRushTime(99);
        }, 1000);
      } else {
        setLotteryResult('MISS');
      }
      setIsLotteryRunning(false);
      setStocks(s => Math.max(s - 1, 0));
    }, 1500);
  };

  const bind = useGesture({
    onDrag: ({ offset: [ox, oy], active }) => {
      if (!audioStarted || !isPlaying) return;
      if (active) {
        dragX.set(ox);
        dragY.set(oy);
      }
    },
    onDragEnd: ({ direction: [dx, dy], velocity: [vx, vy], tap, offset: [ox, oy] }) => {
      if (!audioStarted) {
        startEngine();
        setAudioStarted(true);
        return;
      }
      if (!isPlaying) return;

      if (tap) {
        toggleFlip(wordIndex);
        dragX.set(0);
        dragY.set(0);
        return;
      }

      // Refined thresholds for better sensitivity
      const vThreshold = 0.1; // Lowered from 0.2
      const dThreshold = 50;  // Lowered from 100

      if ((vy > vThreshold && dy < -0.1) || oy < -dThreshold) { // NEXT
        playSlide();
        setDirection(1);
        const onBeat = validateRhythm();
        setWordIndex(prev => (prev + 1) % WORDS.length);
        if (onBeat) {
          setCombo(c => c + 1);
          handleHesoLottery(true);
          if (isRush && Math.random() < 1 / 6) setRushTime(t => t + 20);
        } else {
          setCombo(0);
          handleHesoLottery(false);
        }
      } else if ((vy > vThreshold && dy > 0.1) || oy > dThreshold) { // PREV
        playSlide();
        setDirection(-1);
        setWordIndex(prev => (prev - 1 + WORDS.length) % WORDS.length);
        setCombo(0);
      } else if ((vx > vThreshold && dx > 0.1) || ox > dThreshold) { // MEMORIZE
        playRotation();
        setSouls(prev => [...prev, { id: Date.now(), x: 0, y: 0, target: 'right' }]);
      }

      dragX.set(0);
      dragY.set(0);
    }
  }, { drag: { from: () => [dragX.get(), dragY.get()], threshold: 5 } }); // Added drag threshold

  return (
    <div className="app-container" style={{ userSelect: 'none', overflow: 'hidden' }}>
      <motion.div
        animate={{ opacity: isPlaying ? [0.05, 0.15, 0.05] : 0.05 }}
        transition={{ duration: 60 / bpm, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', pointerEvents: 'none' }}
      />

      <header className="glass" style={{ height: '140px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: i < stocks ? [1, 1.3, 1] : 1, rotate: i < stocks ? [0, 10, -10, 0] : 0 }}
                style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: i < stocks ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                  boxShadow: i < stocks ? '0 0 15px var(--accent-color)' : 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}
              >
                {i < stocks && <img src="/assets/images/egg.png" style={{ width: '120%', height: '120%', objectFit: 'contain' }} alt="egg" />}
              </motion.div>
            ))}
          </div>
          <div className="glass" style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-color)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
            {games}G
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <motion.div
            animate={{
              y: isPlaying ? [0, -8, 0] : 0,
              scale: isLotteryRunning ? [1, 1.1, 1] : 1
            }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ width: '70px', height: '70px', position: 'absolute', top: '-15px', zIndex: 5 }}
          >
            <img src="/assets/images/hen.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="hen" />
          </motion.div>

          <div style={{
            fontSize: '2.8rem', fontWeight: '950', letterSpacing: '10px',
            color: isRush ? 'var(--accent-color)' : 'white',
            textShadow: isRush ? '0 0 20px var(--accent-glow)' : '0 0 10px rgba(255,255,255,0.3)',
            filter: isLotteryRunning ? 'blur(3px)' : 'none'
          }}>
            {isLotteryRunning ? '7 7 7' : (isRush ? (rushTime < 10 ? `0${rushTime}` : rushTime) : '7 7 7')}
          </div>

          {lotteryResult && !isLotteryRunning && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', color: lotteryResult === '777' ? 'var(--accent-color)' : 'white', fontWeight: '900', fontSize: '1.2rem', top: '10px' }}
            >
              {lotteryResult}
            </motion.div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div
          animate={{ scale: isPlaying ? [1, 1.1, 1] : 1, opacity: isPlaying ? [0.1, 0.3, 0.1] : 0.1 }}
          transition={{ duration: 60 / bpm / 2, repeat: Infinity }}
          style={{ position: 'absolute', width: '350px', height: '350px', border: '2px solid var(--accent-glow)', borderRadius: '50%', pointerEvents: 'none' }}
        />

        <AnimatePresence>
          {combo > 0 && (
            <motion.div
              key={combo}
              initial={{ x: -20, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              style={{ position: 'absolute', top: '30px', left: '30px', color: 'var(--accent-color)', fontWeight: '900', fontSize: '1.5rem', fontStyle: 'italic', textShadow: '0 0 15px var(--accent-glow)' }}
            >
              {combo} COMBO
            </motion.div>
          )}
        </AnimatePresence>

        <div {...bind()} style={{ width: '100%', maxWidth: '330px', height: '440px', perspective: '1200px', cursor: isPlaying ? 'grab' : 'default', zIndex: 10, position: 'relative' }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={wordIndex}
              custom={direction}
              variants={{
                enter: (d: number) => ({
                  y: d > 0 ? 500 : (d < 0 ? -500 : 0),
                  opacity: 0,
                  scale: 0.8,
                  rotateX: d > 0 ? -45 : (d < 0 ? 45 : 0)
                }),
                center: {
                  y: 0,
                  x: 0,
                  opacity: 1,
                  scale: 1,
                  rotateX: 0,
                  zIndex: 10
                },
                exit: (d: number) => ({
                  y: d > 0 ? -500 : (d < 0 ? 500 : 0),
                  opacity: 0,
                  scale: 0.8,
                  rotateX: d > 0 ? 45 : (d < 0 ? -45 : 0),
                  zIndex: 0
                })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              style={{
                width: '100%', height: '100%', position: 'absolute',
                transformStyle: 'preserve-3d',
                pointerEvents: isPlaying ? 'auto' : 'none'
              }}
            >
              <motion.div
                style={{
                  width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d',
                  x: springX, y: springY, rotateX, rotateY
                }}
              >
                <WordCard
                  word={WORDS[wordIndex].word}
                  definition={WORDS[wordIndex].definition}
                  isFlipped={!!flipStates[wordIndex]}
                  onFlip={() => isPlaying && toggleFlip(wordIndex)}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div style={{
            position: 'absolute', top: 10, bottom: -10, left: 10, right: 10,
            background: 'rgba(255,255,255,0.03)', borderRadius: '32px', zIndex: -1,
            transform: 'scale(0.95) translateY(10px)', border: '1px solid rgba(255,255,255,0.05)'
          }} />
        </div>

        <AnimatePresence>
          {souls.map(soul => (
            <motion.div
              key={soul.id}
              initial={{ scale: 0.5, opacity: 1, x: 0, y: 0 }}
              animate={{
                scale: [1, 1.5, 0.5],
                opacity: [1, 0.8, 0],
                y: soul.target === 'hen' ? -450 : -50,
                x: soul.target === 'right' ? 350 : 0
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              style={{ position: 'absolute', color: 'var(--accent-color)', zIndex: 1000 }}
            >
              <Zap fill="currentColor" size={40} className="glow" />
            </motion.div>
          ))}
        </AnimatePresence>

        <div style={{ position: 'absolute', bottom: '15px', width: '100%', display: 'flex', justifyContent: 'space-around', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', opacity: 0.6, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronUp size={14} /> NEXT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronDown size={14} /> PREV</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronRight size={14} /> MEMORIZE</div>
        </div>
      </main>

      <footer className="glass" style={{ height: '100px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-glass)', zIndex: 100 }}>
        <button
          onClick={() => isPlaying ? stopEngine() : startEngine()}
          className="glass"
          style={{
            width: '50px', height: '50px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isPlaying ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)',
            color: isPlaying ? 'white' : 'black',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: isPlaying ? 'none' : '0 0 15px var(--accent-glow)'
          }}
        >
          {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="black" />}
        </button>

        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="range" min="50" max="60" value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
          />
        </div>
        <div style={{ minWidth: '70px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>RHYTHM</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-color)' }}>{bpm} BPM</div>
        </div>
      </footer>

      {!audioStarted && (
        <div
          onClick={() => { startEngine(); setAudioStarted(true); }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <Play size={80} fill="var(--accent-color)" color="var(--accent-color)" />
          </motion.div>
          <div style={{ marginTop: '2rem', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '2px' }}>TAP TO START SESSION</div>
        </div>
      )}

      <AnimatePresence>
        {isRush && rushTime > 95 && (
          <motion.div
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            style={{
              position: 'absolute', top: '35%', left: '5%', right: '5%', zIndex: 1500,
              background: 'linear-gradient(45deg, #ffd700, #ff8c00)', color: 'black',
              padding: '3rem 1rem', borderRadius: '30px', textAlign: 'center',
              boxShadow: '0 0 50px var(--accent-glow)', fontWeight: '900', fontSize: '3.5rem'
            }}
          >
            FEVER RUSH!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
