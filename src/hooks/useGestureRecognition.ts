import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DrawingUtils,
  FilesetResolver,
  GestureRecognizer,
} from '@mediapipe/tasks-vision';
import type { GestureDetectionState } from '../types/communication';
import { interpretGestureResult } from '../utils/gestureMapping';
import { mapMediaDeviceError } from '../utils/speechErrors';

const LOCAL_WASM_PATH = '/mediapipe/wasm';
const LOCAL_MODEL_PATH = '/mediapipe/gesture_recognizer.task';
const CDN_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

export interface UseGestureRecognitionResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isCameraActive: boolean;
  isModelLoading: boolean;
  isModelReady: boolean;
  detection: GestureDetectionState;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  resetDetection: () => void;
}

export function useGestureRecognition(options?: {
  onRecognizedChange?: (state: Extract<GestureDetectionState, { status: 'recognized' }>) => void;
}): UseGestureRecognitionResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);
  const lastTimestampRef = useRef(0);
  const lastRecognizedKeyRef = useRef<string | null>(null);
  const stableCountRef = useRef(0);
  const candidateKeyRef = useRef<string | null>(null);

  const onRecognizedChangeRef = useRef(options?.onRecognizedChange);
  onRecognizedChangeRef.current = options?.onRecognizedChange;

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [detection, setDetection] = useState<GestureDetectionState>({ status: 'idle' });
  const [error, setError] = useState<string | null>(null);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const stopCamera = useCallback(() => {
    isActiveRef.current = false;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    clearCanvas();
    lastVideoTimeRef.current = -1;
    lastRecognizedKeyRef.current = null;
    candidateKeyRef.current = null;
    stableCountRef.current = 0;

    setIsCameraActive(false);
    setDetection({ status: 'idle' });
  }, [clearCanvas]);

  const ensureRecognizer = useCallback(async (): Promise<GestureRecognizer> => {
    if (recognizerRef.current) {
      return recognizerRef.current;
    }

    setIsModelLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(LOCAL_WASM_PATH);

      let recognizer: GestureRecognizer;
      try {
        recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: LOCAL_MODEL_PATH,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });
      } catch {
        // Fallback to CPU / CDN model if GPU delegate or local file fails
        try {
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: LOCAL_MODEL_PATH,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
          });
        } catch {
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: CDN_MODEL_PATH,
            },
            runningMode: 'VIDEO',
            numHands: 1,
          });
        }
      }

      recognizerRef.current = recognizer;
      setIsModelReady(true);
      return recognizer;
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const runDetectionLoop = useCallback(() => {
    if (!isActiveRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const recognizer = recognizerRef.current;

    if (
      video &&
      canvas &&
      recognizer &&
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const now = Math.max(lastTimestampRef.current + 1, Math.round(performance.now()));
        lastTimestampRef.current = now;

        const results = recognizer.recognizeForVideo(video, now);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (results.landmarks && results.landmarks.length > 0) {
            const drawingUtils = new DrawingUtils(ctx);
            for (const landmarks of results.landmarks) {
              drawingUtils.drawConnectors(
                landmarks,
                GestureRecognizer.HAND_CONNECTIONS,
                { color: '#2DD4BF', lineWidth: 3 }
              );
              drawingUtils.drawLandmarks(landmarks, {
                color: '#0F3D4C',
                lineWidth: 1,
                radius: 4,
              });
            }
          }
        }

        const landmarksCount = results.landmarks?.length ?? 0;
        const topGesture = results.gestures?.[0]?.[0];
        const nextState = interpretGestureResult(
          landmarksCount,
          topGesture?.categoryName,
          topGesture?.score
        );

        setDetection(nextState);

        if (nextState.status === 'recognized') {
          if (candidateKeyRef.current === nextState.gesture.key) {
            stableCountRef.current += 1;
          } else {
            candidateKeyRef.current = nextState.gesture.key;
            stableCountRef.current = 1;
          }

          // Require 3 consecutive frames before notifying auto-speak callback
          if (
            stableCountRef.current >= 3 &&
            lastRecognizedKeyRef.current !== nextState.gesture.key
          ) {
            lastRecognizedKeyRef.current = nextState.gesture.key;
            onRecognizedChangeRef.current?.(nextState);
          }
        } else {
          candidateKeyRef.current = null;
          stableCountRef.current = 0;
          if (nextState.status === 'no-hand') {
            lastRecognizedKeyRef.current = null;
          }
        }
      }
    }

    if (isActiveRef.current) {
      rafIdRef.current = requestAnimationFrame(runDetectionLoop);
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (isActiveRef.current) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser.');
      return;
    }

    setError(null);
    setDetection({ status: 'starting' });

    try {
      const [stream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        }),
        ensureRecognizer(),
      ]);

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      isActiveRef.current = true;
      setIsCameraActive(true);
      setDetection({ status: 'no-hand' });
      rafIdRef.current = requestAnimationFrame(runDetectionLoop);
    } catch (err) {
      stopCamera();
      setError(mapMediaDeviceError(err));
    }
  }, [ensureRecognizer, runDetectionLoop, stopCamera]);

  const resetDetection = useCallback(() => {
    lastRecognizedKeyRef.current = null;
    candidateKeyRef.current = null;
    stableCountRef.current = 0;
    setError(null);
    setDetection(isActiveRef.current ? { status: 'no-hand' } : { status: 'idle' });
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (recognizerRef.current) {
        recognizerRef.current.close();
        recognizerRef.current = null;
      }
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isCameraActive,
    isModelLoading,
    isModelReady,
    detection,
    error,
    startCamera,
    stopCamera,
    resetDetection,
  };
}
