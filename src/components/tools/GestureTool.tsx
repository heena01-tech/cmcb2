import { useCallback, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CameraOff,
  Hand,
  RotateCcw,
  Square,
  Sun,
  Volume2,
} from 'lucide-react';
import { useGestureRecognition } from '../../hooks/useGestureRecognition';
import type { UseTextToSpeechResult } from '../../hooks/useTextToSpeech';
import { SUPPORTED_GESTURE_LIST } from '../../utils/gestureMapping';

interface GestureToolProps {
  tts: UseTextToSpeechResult;
}

export function GestureTool({ tts }: GestureToolProps) {
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [lastRecognizedText, setLastRecognizedText] = useState<string>('');
  const [lastRecognizedLabel, setLastRecognizedLabel] = useState<string>('');

  const handleRecognizedChange = useCallback(
    (state: {
      status: 'recognized';
      gesture: { label: string; message: string };
    }) => {
      setLastRecognizedLabel(state.gesture.label);
      setLastRecognizedText(state.gesture.message);
      if (autoSpeak) {
        tts.speak(state.gesture.message);
      }
    },
    [autoSpeak, tts]
  );

  const gestureHook = useGestureRecognition({
    onRecognizedChange: handleRecognizedChange,
  });

  const activeMessage =
    gestureHook.detection.status === 'recognized'
      ? gestureHook.detection.gesture.message
      : lastRecognizedText;

  const activeLabel =
    gestureHook.detection.status === 'recognized'
      ? gestureHook.detection.gesture.label
      : lastRecognizedLabel;

  const handleReset = () => {
    tts.stop();
    setLastRecognizedLabel('');
    setLastRecognizedText('');
    gestureHook.resetDetection();
  };

  const handleStopCamera = () => {
    tts.stop();
    gestureHook.stopCamera();
  };

  const getRecognitionStatusText = (): string => {
    switch (gestureHook.detection.status) {
      case 'idle':
        return 'Camera is off. Click "Start Camera" to detect gestures.';
      case 'starting':
        return 'Opening built-in webcam and loading MediaPipe hand gesture model...';
      case 'no-hand':
        return 'No hand detected — hold one hand clearly inside the camera frame.';
      case 'unrecognized':
        return 'Hand detected, but gesture is not recognized. Try one of the 5 supported gestures.';
      case 'recognized':
        return `Recognized: ${gestureHook.detection.gesture.label} (${Math.round(
          gestureHook.detection.confidence * 100
        )}% model confidence)`;
    }
  };

  return (
    <section className="tool-panel" aria-labelledby="gesture-heading">
      <div className="tool-panel-header">
        <div>
          <span className="eyebrow-tag">Built-in Webcam + MediaPipe</span>
          <h2 id="gesture-heading">Basic Gesture to Text</h2>
          <p className="tool-subtitle">
            Uses your laptop&apos;s built-in webcam and MediaPipe Gesture Recognizer to detect a limited set of 5 basic hand gestures.
          </p>
        </div>
        <div
          className={`status-pill ${
            gestureHook.isCameraActive
              ? 'status-active'
              : gestureHook.isModelLoading
                ? 'status-warn'
                : 'status-idle'
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="status-dot" />
          {gestureHook.isModelLoading
            ? 'Loading Model...'
            : gestureHook.isCameraActive
              ? 'Camera Active'
              : 'Camera Off'}
        </div>
      </div>

      <div className="info-banner">
        <Camera size={18} aria-hidden="true" />
        <span>
          <strong>Camera permission:</strong> Clicking <em>Start Camera</em> requests access to your laptop webcam solely for live hand-gesture recognition in your browser. Video stays on your device and stops immediately when you click <em>Stop Camera</em>.
        </span>
      </div>

      {gestureHook.error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{gestureHook.error}</span>
        </div>
      )}

      <div className="button-row">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={gestureHook.startCamera}
          disabled={gestureHook.isCameraActive || gestureHook.isModelLoading}
        >
          <Camera size={20} aria-hidden="true" />
          Start Camera
        </button>

        <button
          type="button"
          className="btn btn-danger btn-lg"
          onClick={handleStopCamera}
          disabled={!gestureHook.isCameraActive && !gestureHook.isModelLoading}
        >
          <CameraOff size={20} aria-hidden="true" />
          Stop Camera
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => activeMessage && tts.speak(activeMessage)}
          disabled={!tts.isSupported || !activeMessage}
        >
          <Volume2 size={18} aria-hidden="true" />
          Speak Message
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={tts.stop}
          disabled={!tts.isSpeaking}
        >
          <Square size={16} aria-hidden="true" />
          Stop Speaking
        </button>

        <button type="button" className="btn btn-ghost" onClick={handleReset}>
          <RotateCcw size={18} aria-hidden="true" />
          Clear / Reset
        </button>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={autoSpeak}
          onChange={(e) => setAutoSpeak(e.target.checked)}
        />
        <span>Automatically speak recognized gesture when detected</span>
      </label>

      <div className="gesture-layout">
        <div className="camera-stage">
          <div className="camera-frame">
            <video
              ref={gestureHook.videoRef}
              className="camera-video"
              playsInline
              muted
              aria-label="Live webcam preview for gesture detection"
            />
            <canvas
              ref={gestureHook.canvasRef}
              className="camera-overlay"
              aria-hidden="true"
            />
            {!gestureHook.isCameraActive && (
              <div className="camera-placeholder">
                <Camera size={40} aria-hidden="true" />
                <p>Built-in webcam preview is off</p>
                <span>Click &ldquo;Start Camera&rdquo; above to begin</span>
              </div>
            )}
          </div>

          <div
            className={`recognition-status-bar ${
              gestureHook.detection.status === 'recognized'
                ? 'is-recognized'
                : gestureHook.detection.status === 'unrecognized'
                  ? 'is-unrecognized'
                  : ''
            }`}
            role="status"
            aria-live="polite"
          >
            <Hand size={18} aria-hidden="true" />
            <span>{getRecognitionStatusText()}</span>
          </div>
        </div>

        <div className="gesture-output-column">
          <div className="output-card">
            <span className="field-label">Detected Gesture</span>
            <p className="output-gesture-name">
              {activeLabel || 'Waiting for gesture...'}
            </p>
            <span className="field-label">Communication Text</span>
            <p className="output-communication-text">
              {activeMessage || 'Recognized message will appear here'}
            </p>
            {gestureHook.detection.status === 'recognized' && (
              <p className="confidence-note">
                Model confidence: {Math.round(gestureHook.detection.confidence * 100)}%
              </p>
            )}
          </div>

          <div className="tips-card">
            <h3>
              <Sun size={18} aria-hidden="true" />
              Camera &amp; Positioning Tips
            </h3>
            <ul>
              <li>Sit in good front lighting so your hand is clearly visible.</li>
              <li>Keep your hand 40–70 cm from the webcam against a plain background.</li>
              <li>Show one hand at a time and hold each gesture steady for 1 second.</li>
              <li>
                <strong>Scope note:</strong> This prototype supports 5 basic gestures only and does not translate full sign language.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="supported-gestures-section">
        <h3 className="section-subheading">Supported Gestures (5-Gesture Vocabulary)</h3>
        <div className="gesture-vocab-grid">
          {SUPPORTED_GESTURE_LIST.map((item) => {
            const isCurrent =
              gestureHook.detection.status === 'recognized' &&
              gestureHook.detection.gesture.key === item.key;
            return (
              <div
                key={item.key}
                className={`vocab-card ${isCurrent ? 'vocab-card-active' : ''}`}
              >
                <div className="vocab-title">{item.label}</div>
                <div className="vocab-message">&ldquo;{item.message}&rdquo;</div>
                <p className="vocab-hint">{item.hint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
