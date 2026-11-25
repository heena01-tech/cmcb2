import { Hand, Image as ImageIcon, Mic, Volume2 } from 'lucide-react';
import type { UseTextToSpeechResult } from '../../hooks/useTextToSpeech';
import type { ToolId } from '../../types/communication';
import { GestureTool } from '../tools/GestureTool';
import { ImageDescriptionTool } from '../tools/ImageDescriptionTool';
import { SpeechToTextTool } from '../tools/SpeechToTextTool';
import { TextToSpeechTool } from '../tools/TextToSpeechTool';

interface ToolsPageProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  tts: UseTextToSpeechResult;
}

const TOOL_TABS: ReadonlyArray<{
  id: ToolId;
  label: string;
  shortNote: string;
  icon: typeof Volume2;
}> = [
  {
    id: 'tts',
    label: 'Text to Speech',
    shortNote: 'Type or tap phrases to speak',
    icon: Volume2,
  },
  {
    id: 'stt',
    label: 'Speech to Text',
    shortNote: 'Laptop microphone captions',
    icon: Mic,
  },
  {
    id: 'gesture',
    label: 'Basic Gesture to Text',
    shortNote: 'Webcam hand gesture recognition',
    icon: Hand,
  },
  {
    id: 'image',
    label: 'Image Description',
    shortNote: 'Upload & hear image info',
    icon: ImageIcon,
  },
];

export function ToolsPage({ activeTool, onSelectTool, tts }: ToolsPageProps) {
  return (
    <div className="page-container">
      <div className="page-intro">
        <div>
          <span className="eyebrow-tag">Core Modules</span>
          <h1>Communication Tools</h1>
          <p>
            Choose one of the four communication tools below. Each tool uses standard browser capabilities with your laptop&apos;s built-in camera and microphone.
          </p>
        </div>
      </div>

      <div className="tool-selector-grid" role="tablist" aria-label="Communication tools">
        {TOOL_TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTool === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`tool-tab-card ${selected ? 'is-selected' : ''}`}
              onClick={() => {
                tts.stop();
                onSelectTool(tab.id);
              }}
            >
              <div className="tool-tab-icon">
                <Icon size={22} aria-hidden="true" />
              </div>
              <div className="tool-tab-copy">
                <span className="tool-tab-title">{tab.label}</span>
                <span className="tool-tab-note">{tab.shortNote}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {activeTool === 'tts' && <TextToSpeechTool tts={tts} />}
        {activeTool === 'stt' && <SpeechToTextTool tts={tts} />}
        {activeTool === 'gesture' && <GestureTool tts={tts} />}
        {activeTool === 'image' && <ImageDescriptionTool tts={tts} />}
      </div>
    </div>
  );
}
