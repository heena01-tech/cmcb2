import { useCallback, useEffect, useRef, useState } from 'react';
import { mapSpeechRecognitionError } from '../utils/speechErrors';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export interface UseSpeechToTextOptions {
  initialLanguage?: string;
  onFinalResult?: (text: string) => void;
}

export interface UseSpeechToTextResult {
  isSupported: boolean;
  isListening: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  finalTranscript: string;
  interimTranscript: string;
  fullTranscript: string;
  error: string | null;
  permissionDenied: boolean;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export function useSpeechToText(
  options?: UseSpeechToTextOptions
): UseSpeechToTextResult {
  const RecognitionCtor = getSpeechRecognitionConstructor();
  const isSupported = RecognitionCtor !== null;

  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState(options?.initialLanguage ?? 'en-US');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const onFinalResultRef = useRef(options?.onFinalResult);
  onFinalResultRef.current = options?.onFinalResult;

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      recognitionRef.current = null;
      try {
        rec.stop();
      } catch {
        // Ignore if already stopped
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(() => {
    if (!RecognitionCtor) {
      setError(
        'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge on your laptop.'
      );
      return;
    }

    if (recognitionRef.current) {
      stopListening();
    }

    setError(null);
    setPermissionDenied(false);
    shouldKeepListeningRef.current = true;

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalized = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const piece = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalized += piece;
        } else {
          interim += piece;
        }
      }

      if (finalized.trim()) {
        const cleanFinal = finalized.trim();
        setFinalTranscript((prev) => (prev ? `${prev} ${cleanFinal}` : cleanFinal));
        onFinalResultRef.current?.(cleanFinal);
      }
      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionDenied(true);
        shouldKeepListeningRef.current = false;
      } else if (event.error === 'audio-capture') {
        shouldKeepListeningRef.current = false;
      }

      if (event.error !== 'aborted') {
        setError(mapSpeechRecognitionError(event.error));
      }

      if (!shouldKeepListeningRef.current) {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    recognition.onend = () => {
      if (shouldKeepListeningRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
          return;
        } catch {
          shouldKeepListeningRef.current = false;
        }
      }
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
      setIsListening(false);
      setInterimTranscript('');
    };

    try {
      recognition.start();
    } catch (err) {
      shouldKeepListeningRef.current = false;
      recognitionRef.current = null;
      setIsListening(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not start speech recognition. Please try again.'
      );
    }
  }, [RecognitionCtor, language, stopListening]);

  const clearTranscript = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const fullTranscript = [finalTranscript, interimTranscript]
    .filter(Boolean)
    .join(' ');

  return {
    isSupported,
    isListening,
    language,
    setLanguage,
    finalTranscript,
    interimTranscript,
    fullTranscript,
    error,
    permissionDenied,
    startListening,
    stopListening,
    clearTranscript,
  };
}
