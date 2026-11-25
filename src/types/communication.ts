export type PageId = 'home' | 'tools' | 'conversation' | 'about';

export type ToolId = 'tts' | 'stt' | 'gesture' | 'image';

export type SupportedGestureKey =
  | 'Open_Palm'
  | 'Thumb_Up'
  | 'Closed_Fist'
  | 'Victory'
  | 'Pointing_Up';

export interface GestureDefinition {
  key: SupportedGestureKey;
  label: string;
  message: string;
  hint: string;
}

export type GestureDetectionState =
  | { status: 'idle' }
  | { status: 'starting' }
  | { status: 'no-hand' }
  | { status: 'unrecognized'; rawCategory: string | null }
  | { status: 'recognized'; gesture: GestureDefinition; confidence: number };

export interface ConversationMessage {
  id: string;
  sender: 'speaker' | 'responder';
  text: string;
  timestamp: string;
}
