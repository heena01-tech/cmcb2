import { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { SPEECH_LANGUAGES } from '../../data/phrases';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import type { UseTextToSpeechResult } from '../../hooks/useTextToSpeech';
import { copyTextToClipboard } from '../../utils/clipboard';

interface SpeechToTextToolProps {
  tts: UseTextToSpeechResult;
}

export function SpeechToTextTool({ tts }: SpeechToTextToolProps) {
  const stt = useSpeechToText({ initialLanguage: 'en-US' });
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(stt.fullTranscript);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <section className="tool-panel" aria-labelledby="stt-heading">
      <div className="tool-panel-header">
        <div>
          <span className="eyebrow-tag">Built-in Microphone</span>
          <h2 id="stt-heading">Speech to Text</h2>
          <p className="tool-subtitle">
            Captures spoken words through your laptop microphone and displays them in large, readable text.
          </p>
        </div>
        <div
          className={`status-pill ${stt.isListening ? 'status-active' : 'status-idle'}`}
          role="status"
          aria-live="polite"
        >
          <span className="status-dot" />
          {stt.isListening ? 'Microphone Active — Listening' : 'Microphone Off'}
        </div>
      </div>

      <div className="info-banner">
        <Mic size={18} aria-hidden="true" />
        <span>
          <strong>Microphone permission:</strong> Your browser will ask for microphone access when you click{' '}
          <em>Start Listening</em> so speech can be transcribed on screen. Audio is never recorded without clicking Start.
        </span>
      </div>

      {!stt.isSupported && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            <strong>Browser not supported:</strong> Web Speech Recognition is unavailable in this browser. Please open C²B in{' '}
            <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on your laptop.
          </div>
        </div>
      )}

      {stt.error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            {stt.error}
            {stt.permissionDenied && (
              <div className="alert-hint">
                In Chrome, click the camera/microphone icon in the address bar and set Microphone to &ldquo;Allow&rdquo;.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="controls-grid single-column-mobile">
        <div className="form-group">
          <label htmlFor="stt-language" className="field-label">
            Recognition Language
          </label>
          <select
            id="stt-language"
            className="select-input"
            value={stt.language}
            onChange={(e) => stt.setLanguage(e.target.value)}
            disabled={stt.isListening || !stt.isSupported}
          >
            {SPEECH_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={stt.startListening}
          disabled={!stt.isSupported || stt.isListening}
        >
          <Mic size={20} aria-hidden="true" />
          Start Listening
        </button>

        <button
          type="button"
          className="btn btn-danger btn-lg"
          onClick={stt.stopListening}
          disabled={!stt.isListening}
        >
          <MicOff size={20} aria-hidden="true" />
          Stop Listening
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => tts.speak(stt.fullTranscript)}
          disabled={!tts.isSupported || !stt.fullTranscript.trim()}
        >
          <Volume2 size={18} aria-hidden="true" />
          Read Aloud
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleCopy}
          disabled={!stt.fullTranscript.trim()}
        >
          {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy Transcription'}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={stt.clearTranscript}
          disabled={!stt.fullTranscript.trim()}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Clear Transcription
        </button>
      </div>

      <div className="transcript-box" aria-live="polite" aria-label="Recognized speech transcription">
        {stt.finalTranscript || stt.interimTranscript ? (
          <p className="transcript-text">
            <span>{stt.finalTranscript}</span>
            {stt.interimTranscript && (
              <span className="transcript-interim">
                {stt.finalTranscript ? ' ' : ''}
                {stt.interimTranscript}
              </span>
            )}
          </p>
        ) : (
          <p className="transcript-placeholder">
            {stt.isListening
              ? 'Listening... Start speaking into your laptop microphone.'
              : 'Recognized speech will appear here in large, easy-to-read text.'}
          </p>
        )}
      </div>
    </section>
  );
}
