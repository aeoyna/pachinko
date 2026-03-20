import { useEffect, useRef, useState } from 'react';

export const useRhythmEngine = (bpm: number) => {
    const audioContext = useRef<AudioContext | null>(null);
    const nextNoteTime = useRef(0);
    const [currentBeat, setCurrentBeat] = useState(0);
    const [lastBeatTime, setLastBeatTime] = useState(0);

    const playClick = (frequency: number) => {
        if (!audioContext.current) return;
        const osc = audioContext.current.createOscillator();
        const envelope = audioContext.current.createGain();

        osc.frequency.value = frequency;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, audioContext.current.currentTime + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.1);

        osc.connect(envelope);
        envelope.connect(audioContext.current.destination);

        osc.start();
        osc.stop(audioContext.current.currentTime + 0.1);
    };

    const playSlide = () => {
        if (!audioContext.current) return;
        const osc = audioContext.current.createOscillator();
        const envelope = audioContext.current.createGain();

        osc.frequency.setValueAtTime(400, audioContext.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.current.currentTime + 0.2);

        envelope.gain.value = 0.5;
        envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.2);

        osc.connect(envelope);
        envelope.connect(audioContext.current.destination);

        osc.start();
        osc.stop(audioContext.current.currentTime + 0.2);
    };

    const playRotation = () => {
        if (!audioContext.current) return;
        const osc = audioContext.current.createOscillator();
        const envelope = audioContext.current.createGain();

        osc.frequency.setValueAtTime(800, audioContext.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioContext.current.currentTime + 0.1);

        envelope.gain.value = 0.3;
        envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.1);

        osc.connect(envelope);
        envelope.connect(audioContext.current.destination);

        osc.start();
        osc.stop(audioContext.current.currentTime + 0.1);
    };

    useEffect(() => {
        const scheduler = () => {
            if (!audioContext.current) return;

            while (nextNoteTime.current < audioContext.current.currentTime + 0.1) {
                const time = nextNoteTime.current;
                const beatNum = currentBeat % 2;

                // Play beat 1 (High) and beat 2 (Low)
                playClick(beatNum === 0 ? 880 : 440);

                setLastBeatTime(time * 1000); // ms
                setCurrentBeat(prev => prev + 1);
                nextNoteTime.current += 60 / bpm / 2; // 2 beats per whole note cycle? User says "1回の間に2拍うち"
            }
        };

        const timer = setInterval(scheduler, 25);
        return () => clearInterval(timer);
    }, [bpm, currentBeat]);

    const startEngine = () => {
        if (!audioContext.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContext.current = new AudioContextClass();
            nextNoteTime.current = audioContext.current.currentTime;
        }
    };

    return { currentBeat, lastBeatTime, startEngine, playSlide, playRotation };
};
