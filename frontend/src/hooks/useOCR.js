import { createWorker } from 'tesseract.js';
import { useState } from 'react';

// ── Text cleaner ──────────────────────────────────────────────────────────────
function cleanOCRText(raw) {
  return raw
    .replace(/\r\n/g, '\n')           // normalize line endings
    .replace(/[ \t]+/g, ' ')          // collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n')       // max 2 consecutive newlines
    .replace(/[^\x20-\x7E\n₹@.]/g, '') // remove garbage non-printable chars
    .trim();
}

export function useOCR() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractText = async (imageFile) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // ── Validate file ───────────────────────────────────────────────────────
      if (!imageFile) throw new Error('No file provided');
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File must be an image (PNG, JPG, etc.)');
      }
      if (imageFile.size > 10 * 1024 * 1024) {
        throw new Error('Image too large. Please use an image under 10MB.');
      }

      // ── Create worker ───────────────────────────────────────────────────────
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          } else if (m.status === 'loading tesseract core') {
            setProgress(10);
          } else if (m.status === 'loading language traineddata') {
            setProgress(20);
          } else if (m.status === 'initializing api') {
            setProgress(30);
          }
        },
      });

      // ── Set parameters for better accuracy ─────────────────────────────────
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?@#$%&*()-+=:;/\n₹',
        preserve_interword_spaces: '1',
      });

      // ── Run OCR ─────────────────────────────────────────────────────────────
      const { data: { text, confidence } } = await worker.recognize(imageFile);
      await worker.terminate();

      // ── Warn if confidence is low ────────────────────────────────────────────
      if (confidence < 50) {
        setError('Low confidence — try a clearer, higher resolution image');
      }

      const cleaned = cleanOCRText(text);

      if (!cleaned || cleaned.length < 20) {
        throw new Error('Could not extract enough text. Try a clearer screenshot.');
      }

      setProgress(100);
      setIsLoading(false);
      return cleaned;

    } catch (e) {
      setIsLoading(false);
      setProgress(0);
      setError(e.message || 'OCR failed. Please try again.');
      return '';
    }
  };

  return { extractText, progress, isLoading, error };
}