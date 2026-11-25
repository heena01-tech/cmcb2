import { useCallback, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  MessageSquare,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Square,
  Volume2,
} from 'lucide-react';
import { CONVERSATION_QUICK_REPLIES, SPEECH_LANGUAGES } from '../../data/phrases';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import type { UseTextToSpeechResult } from '../../hooks/useTextToSpeech';
import type { ConversationMessage } from '../../types/communication';

interface ConversationViewProps {
  tts: UseTextToSpeechResult;
}

function formatNow(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ConversationView({ tts }: ConversationViewProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [speakerFirst, setSpeakerFirst] = useState(true);

  const appendMessage = useCallback(
    (sender: 'speaker' | 'responder', text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sender,
          text: clean,
          timestamp: formatNow(),
        },
      ]);
    },
    []
  );

  const stt = useSpeechToText({
    initialLanguage: 'en-US',
    onFinalResult: (spokenText) => {
      appendMessage('speaker', spokenText);
    },
  });

  const handleSendAndSpeak = (textToSpeak: string) => {
    const clean = textToSpeak.trim();
    if (!clean) return;
    appendMessage('responder', clean);
    tts.speak(clean);
    if (textToSpeak === replyText) {
      setReplyText('');
    }
  };

  const handleClearConversation = () => {
    stt.stopListening();
    stt.clearTranscript();
    tts.stop();
    setMessages([]);
    setReplyText('');
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendAndSpeak(replyText);
  };

  return (
    <div className="page-container">
      <div className="page-intro">
        <div>
          <span className="eyebrow-tag">Two-Person Communication</span>
          <h1>Simple Conversation Mode</h1>
          <p>
            One person speaks into the laptop microphone while the other reads the live transcription and responds via Text-to-Speech.
          </p>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSpeakerFirst((prev) => !prev)}
          >
            <ArrowLeftRight size={18} aria-hidden="true" />
            Swap Sides
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClearConversation}
            disabled={messages.length === 0 && !replyText && !stt.interimTranscript}
          >
            <RotateCcw size={18} aria-hidden="true" />
            Clear Conversation
          </button>
        </div>
      </div>

      {!stt.isSupported && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>
            Speech-to-Text is not supported in this browser. Use Google Chrome or Microsoft Edge to capture spoken input.
          </span>
        </div>
      )}

      {stt.error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{stt.error}</span>
        </div>
      )}

      <div className={`conversation-grid ${speakerFirst ? '' : 'conversation-swapped'}`}>
        <section className="card conversation-control-card" aria-labelledby="person-a-title">
          <div className="card-top-row">
            <div>
              <span className="eyebrow-tag">Person A — Speaking</span>
              <h2 id="person-a-title">Speak to Text</h2>
            </div>
            <div
              className={`status-pill ${stt.isListening ? 'status-active' : 'status-idle'}`}
              role="status"
            >
              <span className="status-dot" />
              {stt.isListening ? 'Listening' : 'Mic Off'}
            </div>
          </div>

          <p className="muted-text">
            Spoken words are transcribed through your laptop microphone into large text bubbles below.
          </p>

          <div className="form-group">
            <label htmlFor="conv-lang" className="field-label">
              Spoken Language
            </label>
            <select
              id="conv-lang"
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
          </div>

          {stt.interimTranscript && (
            <div className="live-interim-banner" aria-live="polite">
              <strong>Hearing now:</strong> {stt.interimTranscript}
            </div>
          )}
        </section>

        <section className="card conversation-control-card" aria-labelledby="person-b-title">
          <div className="card-top-row">
            <div>
              <span className="eyebrow-tag">Person B — Typing</span>
              <h2 id="person-b-title">Type to Speak Reply</h2>
            </div>
            <div
              className={`status-pill ${tts.isSpeaking ? 'status-active' : 'status-idle'}`}
              role="status"
            >
              <span className="status-dot" />
              {tts.isSpeaking ? 'Speaking' : 'Ready'}
            </div>
          </div>

          <form onSubmit={handleReplySubmit}>
            <div className="form-group">
              <label htmlFor="conv-reply" className="field-label">
                Typed Response
              </label>
              <textarea
                id="conv-reply"
                className="large-textarea"
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here and click Speak Reply..."
              />
            </div>

            <div className="button-row">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={!replyText.trim() || !tts.isSupported}
              >
                <Send size={18} aria-hidden="true" />
                Speak Reply
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={tts.stop}
                disabled={!tts.isSpeaking}
              >
                <Square size={16} aria-hidden="true" />
                Stop Speaking
              </button>
            </div>
          </form>

          <div className="quick-replies-wrap">
            <span className="field-label">Quick Reply Phrases</span>
            <div className="phrases-grid compact-phrases">
              {CONVERSATION_QUICK_REPLIES.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  className="phrase-chip"
                  onClick={() => handleSendAndSpeak(phrase)}
                  disabled={!tts.isSupported}
                >
                  <Volume2 size={15} aria-hidden="true" />
                  <span>{phrase}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="card conversation-feed-card" aria-labelledby="feed-title">
        <div className="card-top-row">
          <h2 id="feed-title">
            <MessageSquare size={20} aria-hidden="true" />
            Conversation Transcript
          </h2>
          <span className="muted-text">{messages.length} messages</span>
        </div>

        <div className="conversation-feed" aria-live="polite">
          {messages.length === 0 && !stt.interimTranscript ? (
            <div className="feed-empty">
              <p>
                No messages yet. Click <strong>Start Listening</strong> for Person A to speak, or type a reply for Person B.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`bubble-row ${
                    msg.sender === 'speaker' ? 'bubble-speaker' : 'bubble-responder'
                  }`}
                >
                  <div className="message-bubble">
                    <div className="bubble-meta">
                      <strong>
                        {msg.sender === 'speaker'
                          ? 'Person A (Spoken)'
                          : 'Person B (Typed & Spoken)'}
                      </strong>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="bubble-text">{msg.text}</p>
                    <button
                      type="button"
                      className="bubble-speak-btn"
                      onClick={() => tts.speak(msg.text)}
                      disabled={!tts.isSupported}
                    >
                      <Volume2 size={14} aria-hidden="true" />
                      Speak again
                    </button>
                  </div>
                </div>
              ))}

              {stt.interimTranscript && (
                <div className="bubble-row bubble-speaker">
                  <div className="message-bubble bubble-interim">
                    <div className="bubble-meta">
                      <strong>Person A (Speaking...)</strong>
                    </div>
                    <p className="bubble-text">{stt.interimTranscript}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
