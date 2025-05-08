"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";
import Cake from "@/components/Cake";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [candlesLit, setCandlesLit] = useState<boolean[]>(Array(5).fill(true));
  const [isBlowing, setIsBlowing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMicAllowed, setIsMicAllowed] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/hbd.mp3");
  }, []);

  useEffect(() => {
    if (!isMicAllowed) return;

    const checkBlow = () => {
      const analyser = analyserRef.current;
      if (!analyser) return;

      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const value = (data[i] - 128) / 128;
        sum += value * value;
      }

      const volume = Math.sqrt(sum / data.length) * 100;

      if (volume > 10) {
        setIsBlowing(true);
        setCandlesLit(prev => {
          const litIndices = prev.map((lit, i) => (lit ? i : -1)).filter(i => i !== -1);
          if (litIndices.length === 0) return prev;
          const randIndex = litIndices[Math.floor(Math.random() * litIndices.length)];
          return prev.map((lit, i) => (i === randIndex ? false : lit));
        });
      } else {
        setIsBlowing(false);
      }
    };

    const interval = setInterval(checkBlow, 100);
    return () => clearInterval(interval);
  }, [isMicAllowed]);

  useEffect(() => {
    let confettiTimeout: NodeJS.Timeout;
    let musicTimeout: NodeJS.Timeout;

    if (candlesLit.every(c => !c)) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      setIsMicAllowed(false);
      setShowConfetti(true);
      setShowImage(true);

      musicTimeout = setTimeout(() => {
        try {
          audioRef.current?.play();
        } catch (err) {
          console.error("Audio playback error:", err);
        }
      }, 2000);

      confettiTimeout = setTimeout(() => setShowConfetti(false), 12000);
    }

    return () => {
      clearTimeout(confettiTimeout);
      clearTimeout(musicTimeout);
    };
  }, [candlesLit]);

  const enableMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setIsMicAllowed(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const resetCandles = () => {
    setCandlesLit(Array(5).fill(true));
    setShowImage(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 flex flex-col items-center justify-center px-4 py-8 sm:p-8 relative text-center">
      {candlesLit.every(c => !c) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-6 sm:top-10 z-50"
        >
          <div className="bg-white/90 backdrop-blur-sm border border-rose-200 px-6 py-3 rounded-xl shadow-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-rose-500 drop-shadow">
              You 🫵 are the best!🫶
            </h2>
            <p>More birthdays to come, good health, be rich, be immortal, be happy.</p>
          </div>
        </motion.div>
      )}


      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={800}
          gravity={0.3}
          tweenDuration={10000}
        />
      )}

      <div className="mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">🎉 Happy Birthday, Ma! 🎂</h1>
        <p className="text-base sm:text-lg text-gray-700">
          {isMicAllowed
            ? "Blow on the cake to extinguish the candles! (or shout idc)"
            : "Happy birthday mother, turn on mic to blow! (or shout nalang para mas dali ok?)"}
        </p>
      </div>

      <div className="w-full max-w-xs sm:max-w-md mb-8">
        <Cake candles={candlesLit} isBlowing={isBlowing} />
      </div>


      <AnimatePresence>
        {showImage && (
          <motion.div
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{ scale: 1, rotate: 360, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <img
              src="/mom.jpg"
              alt="Mom"
              className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-full border-4 border-pink-300 shadow-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>



      <div className="space-y-4 mt-8">
        {!isMicAllowed && candlesLit.some(c => c) ? (
          <Button onClick={enableMicrophone} variant="default">
            Blow Candles
          </Button>
        ) : (
          <Button onClick={resetCandles} variant="outline">
            Let's do it again
          </Button>
        )}
        <p className="text-sm text-gray-500">
          {isMicAllowed
            ? isBlowing
              ? "🎤 Blowing detected! Keep going!"
              : "Ready when you are..."
            : "Click 'Blow Candles' to begin"}
        </p>
      </div>


      <div className="mt-12 text-center">
        <p className="text-lg sm:text-xl text-rose-600 font-semibold">
          🫶 from J. Estano
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Src:{" "}
          <a
            href="https://github.com/JohnEstano/happybirthday-cake"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            github
          </a>
          <br></br>
          cake from:
          <a href="https://codepen.io/fazlurr/pen/gPMJMK" className="underline hover:text-gray-600">CODEPEN</a>
        </p>
      </div>

    </main>


  );
}
