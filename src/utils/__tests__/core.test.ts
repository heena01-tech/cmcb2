import { describe, expect, it } from 'vitest';
import { QUICK_PHRASES } from '../../data/phrases';
import {
  SUPPORTED_GESTURE_LIST,
  interpretGestureResult,
} from '../gestureMapping';
import { generateImageDescription } from '../imageDescription';
import { mapMediaDeviceError, mapSpeechRecognitionError } from '../speechErrors';

describe('C2B Core Utilities', () => {
  it('provides 10 quick phrases including essential requests', () => {
    expect(QUICK_PHRASES).toHaveLength(10);
    expect(QUICK_PHRASES).toContain('Hello');
    expect(QUICK_PHRASES).toContain('Thank you');
    expect(QUICK_PHRASES).toContain('Please help me');
    expect(QUICK_PHRASES).toContain('Yes');
    expect(QUICK_PHRASES).toContain('No');
  });

  it('supports exactly the 5 documented basic gestures', () => {
    expect(SUPPORTED_GESTURE_LIST).toHaveLength(5);
    expect(interpretGestureResult(0, 'Open_Palm', 0.95)).toEqual({
      status: 'no-hand',
    });

    const recognized = interpretGestureResult(1, 'Thumb_Up', 0.89);
    expect(recognized.status).toBe('recognized');
    if (recognized.status === 'recognized') {
      expect(recognized.gesture.label).toBe('Thumbs Up');
      expect(recognized.gesture.message).toBe('Yes');
      expect(recognized.confidence).toBe(0.89);
    }

    const unrecognized = interpretGestureResult(1, 'None', 0.2);
    expect(unrecognized).toEqual({
      status: 'unrecognized',
      rawCategory: null,
    });
  });

  it('maps speech and media permission errors to clear user messages', () => {
    expect(mapSpeechRecognitionError('not-allowed')).toContain('Microphone access was denied');
    expect(mapSpeechRecognitionError('audio-capture')).toContain('No working microphone');

    const deniedCam = new DOMException('Denied', 'NotAllowedError');
    expect(mapMediaDeviceError(deniedCam)).toContain('Camera permission was denied');
  });

  it('runs Image Description honestly in Demo Mode when no Vision API is configured', async () => {
    const file = new File(['abc'], 'classroom.png', { type: 'image/png' });
    const result = await generateImageDescription(file, {
      fileName: 'classroom.png',
      fileSizeKB: 12,
      mimeType: 'image/png',
      width: 1280,
      height: 720,
    });

    expect(result.mode).toBe('demo');
    expect(result.description).toContain('Demo mode notice');
    expect(result.description).toContain('1280 by 720 pixels');
  });
});
