import type {
  GestureDefinition,
  GestureDetectionState,
  SupportedGestureKey,
} from '../types/communication';

export const SUPPORTED_GESTURES: Record<SupportedGestureKey, GestureDefinition> = {
  Open_Palm: {
    key: 'Open_Palm',
    label: 'Open Palm',
    message: 'Hello / Stop',
    hint: 'Hold your hand open with all five fingers extended toward the camera.',
  },
  Thumb_Up: {
    key: 'Thumb_Up',
    label: 'Thumbs Up',
    message: 'Yes',
    hint: 'Make a closed hand with your thumb pointing straight up.',
  },
  Closed_Fist: {
    key: 'Closed_Fist',
    label: 'Closed Fist',
    message: 'Stop',
    hint: 'Close all fingers into a steady fist facing the camera.',
  },
  Victory: {
    key: 'Victory',
    label: 'Victory Sign',
    message: 'Peace',
    hint: 'Raise your index and middle fingers in a V shape.',
  },
  Pointing_Up: {
    key: 'Pointing_Up',
    label: 'Pointing Gesture',
    message: 'Look here / I need something',
    hint: 'Raise your index finger upward with other fingers folded.',
  },
};

export const SUPPORTED_GESTURE_LIST: readonly GestureDefinition[] = Object.values(
  SUPPORTED_GESTURES
);

export function isSupportedGestureKey(value: string): value is SupportedGestureKey {
  return value in SUPPORTED_GESTURES;
}

/**
 * Maps genuine MediaPipe GestureRecognizer outputs into UI state.
 * Never fabricates gestures or confidence scores.
 */
export function interpretGestureResult(
  landmarksCount: number,
  categoryName: string | null | undefined,
  score: number | null | undefined
): GestureDetectionState {
  if (landmarksCount <= 0) {
    return { status: 'no-hand' };
  }

  if (categoryName && isSupportedGestureKey(categoryName) && typeof score === 'number') {
    return {
      status: 'recognized',
      gesture: SUPPORTED_GESTURES[categoryName],
      confidence: score,
    };
  }

  return {
    status: 'unrecognized',
    rawCategory: categoryName && categoryName !== 'None' ? categoryName : null,
  };
}
