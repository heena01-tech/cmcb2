import { useState } from 'react';
import {
  Check,
  Copy,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react';
import { QUICK_PHRASES } from '../../data/phrases';
import type { UseTextToSpeechResult } from '../../hooks/useTextToSpeech';
import { copyTextToClipboard } from '../../utils/clipboard';

interface TextToSpeechToolProps {
  tts: UseTextToSpeechResult;
}

export function TextToSpeechTool({ tts }: TextToSpeechToolProps) {
  const [text, setText] = useState('Hello! I am using Cross-Modal Communication Bridge.');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleQuickPhrase = (phrase: string) => {
    setText(phrase);
    tts.speak(phrase);
  };

  return (
    <section className="tool-panel" aria-labelledby="tts-heading">
      <div className="tool-panel-header">
        <div>
          <span className="eyebrow-tag">Speech Synthesis</span>
          <h2 id="tts-heading">Text to Speech</h2>
          <p className="tool-subtitle">
            Type a message or tap a quick phrase to speak aloud using your browser&apos;s speech engine.
          </p>
        </div>
        <div
          className={`status-pill ${tts.isSpeaking ? (tts.isPaused ? 'status-warn' : 'status-active') : 'status-idle'}`}
          role="status"
          aria-live="polite"
        >
          <span className="status-dot" />
          {tts.isSpeaking ? (tts.isPaused ? 'Paused' : 'Speaking') : 'Ready'}
        </div>
      </div>

      {!tts.isSupported && (
        <div className="alert alert-error" role="alert">
          Text-to-Speech (Web Speech Synthesis API) is not supported in this browser. Try Google Chrome or Microsoft Edge.
        </div>
      )}

      {tts.error && (
        <div className="alert alert-error" role="alert">
          {tts.error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="tts-input" className="field-label">
          Message to Speak
        </label>
        <textarea
          id="tts-input"
          className="large-textarea"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type what you want to say..."
        />
      </div>

      <div className="button-row">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => tts.speak(text)}
          disabled={!tts.isSupported || !text.trim()}
        >
          <Volume2 size={20} aria-hidden="true" />
          Speak
        </button>

        <button
          type="button"
          className="btn btn-danger btn-lg"
          onClick={tts.stop}
          disabled={!tts.isSpeaking}
        >
          <Square size={18} aria-hidden="true" />
          Stop Speaking
        </button>

        {tts.canPauseResume && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={tts.isPaused ? tts.resume : tts.pause}
            disabled={!tts.isSpeaking}
          >
            {tts.isPaused ? (
              <>
                <Play size={18} aria-hidden="true" />
                Resume
              </>
            ) : (
              <>
                <Pause size={18} aria-hidden="true" />
                Pause
              </>
            )}
          </button>
        )}

        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleCopy}
          disabled={!text.trim()}
        >
          {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy Text'}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            tts.stop();
            setText('');
          }}
          disabled={!text}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Clear Text
        </button>
      </div>

      <div className="controls-grid">
        <div className="form-group">
          <label htmlFor="tts-voice" className="field-label">
            Voice
          </label>
          <select
            id="tts-voice"
            className="select-input"
            value={tts.selectedVoiceURI}
            onChange={(e) => tts.setSelectedVoiceURI(e.target.value)}
            disabled={tts.voices.length === 0}
          >
            {tts.voices.length === 0 ? (
              <option value="">Default system voice</option>
            ) : (
              tts.voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tts-rate" className="field-label">
            Speech Speed: <strong>{tts.rate.toFixed(1)}x</strong>
          </label>
          <input
            id="tts-rate"
            type="range"
            className="range-input"
            min={0.6}
            max={1.6}
            step={0.1}
            value={tts.rate}
            onChange={(e) => tts.setRate(Number(e.target.value))}
          />
          <div className="range-labels">
            <span>Slower (0.6x)</span>
            <span>Normal (1.0x)</span>
            <span>Faster (1.6x)</span>
          </div>
        </div>
      </div>

      <div className="quick-phrases-section">
        <h3 className="section-subheading">Quick Phrases (One-Click Speak)</h3>
        <div className="phrases-grid">
          {QUICK_PHRASES.map((phrase) => (
            <button
              key={phrase}
              type="button"
              className="phrase-chip"
              onClick={() => handleQuickPhrase(phrase)}
              disabled={!tts.isSupported}
            >
              <Volume2 size={16} aria-hidden="true" />
              <span>{phrase}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
