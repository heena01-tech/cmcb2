import { AlertTriangle, CheckCircle2, Cpu, Users } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="page-container">
      <div className="page-intro">
        <div>
          <span className="eyebrow-tag">Project Documentation</span>
          <h1>About Cross-Modal Communication Bridge</h1>
          <p>
            A practical, browser-based accessibility mini-project designed to make everyday face-to-face communication easier without specialized hardware.
          </p>
        </div>
      </div>

      <div className="about-grid">
        <section className="card">
          <h2>Project Objective</h2>
          <p>
            Build a simple, reliable web application that bridges communication across different modalities — written text, spoken audio, basic hand gestures, and image descriptions — using only a standard laptop&apos;s built-in webcam, microphone, speakers, and web browser.
          </p>
        </section>

        <section className="card">
          <h2>Problem Statement</h2>
          <p>
            People with hearing, speech, or visual impairments often face barriers when communicating with someone who does not share the same communication method. Existing assistive tools are often fragmented across separate apps or require costly external hardware.
          </p>
        </section>

        <section className="card">
          <h2>Proposed Solution</h2>
          <p>
            C²B brings five focused, genuinely working tools into one clean interface: Text-to-Speech with quick phrases, live Speech-to-Text captions, webcam-based basic gesture recognition, Image Description Assistant, and a two-person Conversation Mode that connects speech and typed replies in real time.
          </p>
        </section>

        <section className="card">
          <h2>
            <Users size={20} aria-hidden="true" />
            Target Users
          </h2>
          <ul className="clean-list">
            <li>Deaf and hard-of-hearing individuals reading live spoken captions.</li>
            <li>Non-speaking or speech-impaired individuals communicating via text, quick phrases, or basic gestures.</li>
            <li>Blind and low-vision users listening to spoken descriptions and audio output.</li>
            <li>Everyday conversation partners (friends, teachers, service staff) interacting face-to-face.</li>
          </ul>
        </section>

        <section className="card">
          <h2>
            <Cpu size={20} aria-hidden="true" />
            Technologies Used
          </h2>
          <ul className="clean-list">
            <li>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span><strong>React + TypeScript + Vite:</strong> Fast, modular single-page web architecture.</span>
            </li>
            <li>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span><strong>Web Speech API:</strong> Browser Speech Synthesis (TTS) and Speech Recognition (STT) via the laptop microphone.</span>
            </li>
            <li>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span><strong>MediaDevices API:</strong> Browser webcam access using the laptop&apos;s built-in camera.</span>
            </li>
            <li>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span><strong>MediaPipe Gesture Recognizer:</strong> On-device hand landmark tracking and basic gesture classification.</span>
            </li>
          </ul>
        </section>

        <section className="card limitation-card">
          <h2>
            <AlertTriangle size={20} aria-hidden="true" />
            Current Prototype Limitations
          </h2>
          <ul className="clean-list">
            <li>
              <strong>Limited gesture vocabulary:</strong> The Basic Gesture to Text tool recognizes 5 static hand gestures (Open Palm, Thumbs Up, Closed Fist, Victory Sign, and Pointing Gesture). It does <em>not</em> translate full sign language sentences or continuous ASL/ISL.
            </li>
            <li>
              <strong>Image Description mode:</strong> When no external Vision AI API endpoint is configured, the Image Description Assistant runs in clearly labeled Demo Mode and reads genuine file metadata rather than pretending to analyze image scenes.
            </li>
            <li>
              <strong>Browser support:</strong> Web Speech Recognition works best in Chromium-based desktop browsers (Google Chrome or Microsoft Edge) with microphone permission enabled.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
