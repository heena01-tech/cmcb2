import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Eye,
  ImagePlus,
  Info,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react';
import type { UseTextToSpeechResult } from '../../hooks/useTextToSpeech';
import {
  generateImageDescription,
  isVisionApiConfigured,
  readImageMetadata,
  type ImageDescriptionResult,
  type ImageMetadata,
} from '../../utils/imageDescription';

interface ImageDescriptionToolProps {
  tts: UseTextToSpeechResult;
}

export function ImageDescriptionTool({ tts }: ImageDescriptionToolProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [result, setResult] = useState<ImageDescriptionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiConfigured = isVisionApiConfigured();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(nextUrl);
    setResult(null);
    setError(null);

    const meta = await readImageMetadata(file, nextUrl);
    setMetadata(meta);
  };

  const handleDescribe = async () => {
    if (!selectedFile || !metadata) return;
    setIsLoading(true);
    setError(null);

    try {
      const nextResult = await generateImageDescription(selectedFile, metadata);
      setResult(nextResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not generate image description.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    tts.stop();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setMetadata(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="tool-panel" aria-labelledby="image-heading">
      <div className="tool-panel-header">
        <div>
          <span className="eyebrow-tag">Visual Assistance</span>
          <h2 id="image-heading">Image Description Assistant</h2>
          <p className="tool-subtitle">
            Upload an image to preview it, obtain a description, and listen to it aloud using Text-to-Speech.
          </p>
        </div>
        <div
          className={`status-pill ${apiConfigured ? 'status-active' : 'status-warn'}`}
          role="status"
        >
          <span className="status-dot" />
          {apiConfigured ? 'Vision API Connected' : 'Demo Mode (No Vision API)'}
        </div>
      </div>

      {!apiConfigured && (
        <div className="info-banner banner-warn">
          <Info size={18} aria-hidden="true" />
          <span>
            <strong>Demo Mode:</strong> No external AI vision API is currently connected. This tool reads real image file properties (name, type, and dimensions) without simulating fake AI scene recognition. Real scene description requires connecting a vision model/API via <code>VITE_VISION_API_URL</code>.
          </span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="button-row">
        <input
          ref={fileInputRef}
          id="image-upload-input"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
        <label htmlFor="image-upload-input" className="btn btn-primary btn-lg">
          <ImagePlus size={20} aria-hidden="true" />
          Upload Image
        </label>

        <button
          type="button"
          className="btn btn-secondary btn-lg"
          onClick={handleDescribe}
          disabled={!selectedFile || isLoading}
        >
          <Eye size={20} aria-hidden="true" />
          {isLoading ? 'Describing...' : 'Describe Image'}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => result && tts.speak(result.description)}
          disabled={!tts.isSupported || !result}
        >
          <Volume2 size={18} aria-hidden="true" />
          Speak Description
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

        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleClear}
          disabled={!selectedFile}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Clear Image
        </button>
      </div>

      <div className="image-layout">
        <div className="image-preview-box">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={selectedFile ? `Uploaded preview: ${selectedFile.name}` : 'Uploaded preview'}
              className="uploaded-preview"
            />
          ) : (
            <div className="image-placeholder">
              <ImagePlus size={40} aria-hidden="true" />
              <p>No image uploaded yet</p>
              <span>Choose an image file to preview and describe</span>
            </div>
          )}
        </div>

        <div className="image-result-box">
          <span className="field-label">
            {result?.mode === 'api'
              ? 'AI Image Description'
              : result?.mode === 'demo'
                ? 'Demo Mode Output (Not AI Analysis)'
                : 'Description Output'}
          </span>

          {result ? (
            <>
              <p className="description-output-text">{result.description}</p>
              <p className="confidence-note">{result.details}</p>
            </>
          ) : metadata ? (
            <p className="transcript-placeholder">
              Image loaded ({metadata.fileName}, {metadata.width}×{metadata.height}px). Click <strong>Describe Image</strong> to generate output.
            </p>
          ) : (
            <p className="transcript-placeholder">
              Upload an image and click <strong>Describe Image</strong>. You can then click <strong>Speak Description</strong> to hear it read aloud.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
