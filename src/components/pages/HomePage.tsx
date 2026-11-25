import {
  ArrowRight,
  Ear,
  Eye,
  Hand,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Volume2,
} from 'lucide-react';
import type { PageId, ToolId } from '../../types/communication';
import { BrandLogo } from '../layout/Navbar';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenTool: (tool: ToolId) => void;
}

export function HomePage({ onNavigate, onOpenTool }: HomePageProps) {
  return (
    <div className="page-container">
      <section className="hero-card">
        <div className="hero-badge-row">
          <BrandLogo />
          <span className="eyebrow-tag">Accessibility Web Application</span>
        </div>

        <h1 className="hero-title">Cross-Modal Communication Bridge (C²B)</h1>
        <p className="hero-tagline">&ldquo;One bridge. Different ways to communicate.&rdquo;</p>
        <p className="hero-description">
          C²B helps people with hearing, speech, and visual communication needs connect smoothly in everyday conversations using only a standard laptop webcam, microphone, and browser.
        </p>

        <div className="button-row">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => onNavigate('tools')}
          >
            Start Communicating
            <ArrowRight size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigate('conversation')}
          >
            <MessageSquare size={20} aria-hidden="true" />
            Open Conversation Mode
          </button>
        </div>
      </section>

      <section className="home-section" aria-labelledby="tools-overview-title">
        <div className="section-header">
          <h2 id="tools-overview-title">Four Core Communication Tools</h2>
          <p>
            Select any tool below to start communicating through text, speech, basic hand gestures, or image descriptions.
          </p>
        </div>

        <div className="feature-cards-grid">
          <article className="feature-card">
            <div className="feature-icon">
              <Volume2 size={24} aria-hidden="true" />
            </div>
            <h3>Text to Speech</h3>
            <p>
              Type messages or use one-click quick phrases so your browser speaks aloud clearly with voice and speed controls.
            </p>
            <button
              type="button"
              className="card-action-link"
              onClick={() => onOpenTool('tts')}
            >
              Open Text to Speech <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <Mic size={24} aria-hidden="true" />
            </div>
            <h3>Speech to Text</h3>
            <p>
              Uses your laptop&apos;s built-in microphone to convert spoken words into large, readable live captions on screen.
            </p>
            <button
              type="button"
              className="card-action-link"
              onClick={() => onOpenTool('stt')}
            >
              Open Speech to Text <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <Hand size={24} aria-hidden="true" />
            </div>
            <h3>Basic Gesture to Text</h3>
            <p>
              Uses your laptop webcam and MediaPipe hand tracking to recognize 5 basic gestures and turn them into text and speech.
            </p>
            <button
              type="button"
              className="card-action-link"
              onClick={() => onOpenTool('gesture')}
            >
              Open Gesture Communication <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <ImageIcon size={24} aria-hidden="true" />
            </div>
            <h3>Image Description</h3>
            <p>
              Upload an image to preview it, inspect description output (or connected Vision API), and hear it spoken aloud.
            </p>
            <button
              type="button"
              className="card-action-link"
              onClick={() => onOpenTool('image')}
            >
              Open Image Description <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>
        </div>
      </section>

      <section className="home-section" aria-labelledby="who-benefits-title">
        <div className="section-header">
          <h2 id="who-benefits-title">Who Benefits from C²B</h2>
          <p>
            Built around real everyday situations without external sensors or complicated setup.
          </p>
        </div>

        <div className="benefit-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <Ear size={22} aria-hidden="true" />
            </div>
            <h3>Deaf &amp; Hard-of-Hearing Users</h3>
            <p>
              Read real-time speech transcriptions from a conversation partner in large, high-contrast text.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <MessageSquare size={22} aria-hidden="true" />
            </div>
            <h3>Non-Speaking &amp; Speech-Impaired Users</h3>
            <p>
              Communicate quickly by typing messages, tapping quick phrases, or showing basic hand gestures to the camera.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <Eye size={22} aria-hidden="true" />
            </div>
            <h3>Blind &amp; Low-Vision Users</h3>
            <p>
              Listen to spoken descriptions and spoken text outputs with accessible, clear audio controls.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
