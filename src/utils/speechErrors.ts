export function mapSpeechRecognitionError(errorCode: string): string {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was denied. Please allow microphone permission in your browser address bar and try again.';
    case 'audio-capture':
      return 'No working microphone was detected. Please check that your laptop microphone is enabled and not in use by another app.';
    case 'no-speech':
      return 'No speech was detected. Please speak clearly toward your laptop microphone.';
    case 'network':
      return 'Speech recognition requires an active internet connection in this browser.';
    case 'aborted':
      return 'Listening stopped.';
    default:
      return `Speech recognition error (${errorCode}). Please try again.`;
  }
}

export function mapMediaDeviceError(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Camera permission was denied. Please allow camera access in your browser settings and try again.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No built-in webcam was found on this device.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Your webcam is currently in use by another application. Close the other app and try again.';
      case 'OverconstrainedError':
        return 'The requested camera resolution is not supported by your built-in webcam.';
      default:
        return `Camera error: ${err.message || err.name}`;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unable to access your laptop camera.';
}
