/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Book, MapPin, Info, ChevronRight, ChevronLeft, AlertCircle, Loader2, Play, Pause, Volume2 } from 'lucide-react';
import { fetchAyah, Ayah } from './services/quranService.ts';

const SURAH_LENGTHS = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];

export default function App() {
  const [surahNum, setSurahNum] = useState<string>('1');
  const [ayahNum, setAyahNum] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeAudio, setActiveAudio] = useState<'arabic' | 'english' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ arabic: Ayah; english: Ayah; transliteration: Ayah; audioArabic: Ayah; audioEnglish: Ayah } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const performSearch = async (s: string, a: string) => {
    if (!s || !a) return;

    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      setActiveAudio(null);
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchAyah(parseInt(s), parseInt(a));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(surahNum, ayahNum);
  };

  const handlePrev = () => {
    let s = parseInt(surahNum);
    let a = parseInt(ayahNum);

    if (a > 1) {
      a--;
    } else if (s > 1) {
      s--;
      a = SURAH_LENGTHS[s - 1];
    } else {
      return; // At the start
    }

    setSurahNum(s.toString());
    setAyahNum(a.toString());
    performSearch(s.toString(), a.toString());
  };

  const handleNext = () => {
    let s = parseInt(surahNum);
    let a = parseInt(ayahNum);

    if (a < SURAH_LENGTHS[s - 1]) {
      a++;
    } else if (s < 114) {
      s++;
      a = 1;
    } else {
      return; // At the end
    }

    setSurahNum(s.toString());
    setAyahNum(a.toString());
    performSearch(s.toString(), a.toString());
  };

  const toggleAudio = (type: 'arabic' | 'english') => {
    const audioUrl = type === 'arabic' ? result?.audioArabic.audio : result?.audioEnglish.audio;
    if (!audioUrl) return;

    if (!audioRef.current || audioRef.current.src !== audioUrl) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setPlaying(false);
        setActiveAudio(null);
      };
    }

    if (playing && activeAudio === type) {
      audioRef.current.pause();
      setPlaying(false);
      setActiveAudio(null);
    } else {
      // If we were playing the other type, pause first
      if (playing) audioRef.current.pause();
      
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed", e);
        setError("Could not play audio. Please try again.");
      });
      setPlaying(true);
      setActiveAudio(type);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Reset audio when result changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      audioRef.current = null;
    }
  }, [result]);

  // Initial fetch
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-brand-bg text-brand-ink">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
        <div className="w-[600px] h-[600px] border border-brand-gold rounded-full" />
        <div className="absolute w-[500px] h-[500px] border border-brand-gold rounded-full rotate-45" />
      </div>

      {/* Top Search / Nav Bar */}
      <nav className="w-full h-auto sm:h-24 border-b border-brand-gold/10 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-12 py-4 sm:py-0 bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-6 h-6 border-2 border-brand-gold rotate-45 flex items-center justify-center">
            <div className="w-3 h-3 bg-brand-gold rotate-45"></div>
          </div>
          <span className="text-base sm:text-xl tracking-[0.1em] sm:tracking-[0.2em] font-light uppercase text-brand-gold">AL-FURQAN BY ABRAR BASHIR</span>
        </div>

        <form onSubmit={handleSearch} className="flex items-center justify-center gap-4 sm:gap-8 w-full sm:w-auto">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-brand-gold/60 mb-1">Surah</span>
            <input 
              type="number" 
              min="1"
              max="114"
              value={surahNum}
              onChange={(e) => setSurahNum(e.target.value)}
              className="bg-transparent border-b border-brand-gold/40 w-12 sm:w-16 text-center focus:outline-none focus:border-brand-gold py-1 text-base sm:text-lg transition-colors"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-brand-gold/60 mb-1">Ayah</span>
            <input 
              type="number" 
              min="1"
              value={ayahNum}
              onChange={(e) => setAyahNum(e.target.value)}
              className="bg-transparent border-b border-brand-gold/40 w-12 sm:w-16 text-center focus:outline-none focus:border-brand-gold py-1 text-base sm:text-lg transition-colors"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-4 sm:px-6 py-2 bg-brand-gold text-brand-bg uppercase text-[10px] sm:text-xs tracking-widest font-bold hover:bg-brand-gold/80 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Recite'}
          </button>
        </form>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center px-4 sm:px-12 py-12 relative z-10">
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-950/20 border border-red-500/20 p-4 rounded-lg flex items-center gap-3 text-red-200 mb-8 w-full max-w-lg"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <p className="text-sm font-sans tracking-wide">{error}</p>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              {/* Metadata Above Card */}
              <div className="text-center mb-12">
                <h2 className="text-brand-gold text-3xl sm:text-4xl mb-2 font-serif font-light">{result.arabic.surah.englishName}</h2>
                <p className="text-brand-ink/60 uppercase tracking-[0.3em] text-[10px] sm:text-xs">
                  {result.arabic.surah.englishNameTranslation} • Ayah {result.arabic.numberInSurah} ({result.arabic.surah.revelationType})
                </p>
              </div>

              {/* The Verse Card */}
              <div className="w-full bg-brand-card border border-brand-gold/10 p-6 sm:p-16 shadow-2xl relative">
                {/* Decorative Icon on Top Edge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-bg px-4 text-brand-gold">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/>
                  </svg>
                </div>

                <div className="relative space-y-12">
                  {/* Arabic Text */}
                  <div className="text-right">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="arabic-text text-4xl sm:text-5xl leading-[1.8] sm:leading-[2] text-brand-arabic"
                    >
                      {result.arabic.text}
                    </motion.p>
                  </div>

                  {/* Transliteration */}
                  <div className="text-center px-4">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm sm:text-base text-brand-gold/60 italic font-sans"
                    >
                      {result.transliteration.text}
                    </motion.p>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />

                  {/* English Translation */}
                  <div className="text-center">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg sm:text-xl italic leading-relaxed text-brand-ink/90 max-w-2xl mx-auto"
                    >
                      "{result.english.text}"
                    </motion.p>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAudio('arabic')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${
                        activeAudio === 'arabic' && playing 
                        ? 'bg-brand-gold text-brand-bg border-brand-gold' 
                        : 'border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10'
                      }`}
                    >
                      {activeAudio === 'arabic' && playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      <span className="text-xs uppercase tracking-widest font-bold">
                        Arabic Recitation
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAudio('english')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${
                        activeAudio === 'english' && playing 
                        ? 'bg-brand-gold text-brand-bg border-brand-gold' 
                        : 'border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10'
                      }`}
                    >
                      {activeAudio === 'english' && playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      <span className="text-xs uppercase tracking-widest font-bold">
                        English Translation
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="w-full mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* Ayah Reference info with arrows */}
                <div className="flex items-center gap-4 sm:gap-8 text-brand-gold/60 text-[10px] tracking-widest font-sans uppercase">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrev}
                    className="p-2 text-brand-gold hover:text-brand-gold/100 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  
                  <div className="flex items-center gap-4">
                    <span className="h-px w-6 sm:w-8 bg-brand-gold/20"></span>
                    <span className="text-brand-gold whitespace-nowrap">Surah {result.arabic.surah.number} • Ayah {result.arabic.numberInSurah}</span>
                    <span className="h-px w-6 sm:w-8 bg-brand-gold/20"></span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNext}
                    className="p-2 text-brand-gold hover:text-brand-gold/100 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 sm:px-12 flex items-center justify-center mt-auto">
        <span className="text-[9px] uppercase tracking-[0.2em] text-brand-gold/20">Nur Quran Explorer • Developed by Abrar Bashir</span>
      </footer>
    </div>
  );
}

function InfoBadge({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-bg rounded-full text-[10px] font-sans font-semibold text-brand-olive/60 uppercase tracking-widest border border-brand-olive/5">
      {icon}
      <span>{label}</span>
    </div>
  );
}

