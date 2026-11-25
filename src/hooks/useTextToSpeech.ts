import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeakOptions {
  voiceURI?: string;
  rate?: number;
}

export interface UseTextToSpeechResult {
  isSupported: boolean;
  canPauseResume: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  setSelectedVoiceURI: (uri: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  isSpeaking: boolean;
  isPaused: boolean;
  error: string | null;
  speak: (text: string, options?: SpeakOptions) => boolean;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useTextToSpeech(): UseTextToSpeechResult {
  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  const canPauseResume =
    isSupported &&
    typeof window.speechSynthesis.pause === 'function' &&
    typeof window.speechSynthesis.resume === 'function';

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      if (available.length > 0) {
        setSelectedVoiceURI((prev) => {
          if (prev && available.some((v) => v.voiceURI === prev)) {
            return prev;
          }
          const englishDefault =
            available.find((v) => v.default && v.lang.startsWith('en')) ||
            available.find((v) => v.lang.startsWith('en')) ||
            available[0];
          return englishDefault?.voiceURI ?? '';
        });
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    utteranceRef.current = null;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const speak = useCallback(
    (rawText: string, options?: SpeakOptions): boolean => {
      if (!isSupported) {
        setError('Text-to-Speech is not supported in this browser.');
        return false;
      }

      const trimmed = rawText.trim();
      if (!trimmed) {
        setError('Please enter or select some text to speak.');
        return false;
      }

      setError(null);
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utteranceRef.current = utterance;

      const targetVoiceURI = options?.voiceURI ?? selectedVoiceURI;
      if (targetVoiceURI) {
        const matchedVoice = voices.find((v) => v.voiceURI === targetVoiceURI);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.rate = options?.rate ?? rate;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utterance.onend = () => {
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
          setIsSpeaking(false);
          setIsPaused(false);
        }
      };

      utterance.onerror = (event) => {
        // 'interrupted' and 'canceled' happen naturally when stop() or a new speak() interrupts playback.
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          setError(`Speech playback error: ${event.error}`);
        }
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
          setIsSpeaking(false);
          setIsPaused(false);
        }
      };

      window.speechSynthesis.speak(utterance);
      return true;
    },
    [isSupported, rate, selectedVoiceURI, voices]
  );

  const pause = useCallback(() => {
    if (!canPauseResume || !isSpeaking || isPaused) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [canPauseResume, isPaused, isSpeaking]);

  const resume = useCallback(() => {
    if (!canPauseResume || !isSpeaking || !isPaused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [canPauseResume, isPaused, isSpeaking]);

  return {
    isSupported,
    canPauseResume,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    rate,
    setRate,
    isSpeaking,
    isPaused,
    error,
    speak,
    stop,
    pause,
    resume,
  };
}
