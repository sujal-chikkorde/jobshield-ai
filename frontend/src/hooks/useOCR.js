import { createWorker } from 'tesseract.js';
import { useState } from 'react';

function cleanOCRText(raw) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove lines that are just symbols or garbage
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 2)
    // Remove lines with too many special chars (garbage lines)
    .filter(line => {
      const specialChars = (line.match(/[^a-zA-Z0-9\s₹@.,!?:;()\-\/]/g) || []).length;
      return specialChars < line.length * 0.4;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
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
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      // Set better OCR parameters for WhatsApp/Telegram screenshots
      await worker.setParameters({
        tessedit_pageseg_mode: '6',       // Assume uniform block of text
        tessedit_char_whitelist: '',       // Allow all characters
        preserve_interword_spaces: '1',   // Keep spacing
      });

      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();

      const cleaned = cleanOCRText(text);
      setIsLoading(false);
      setProgress(100);
      return cleaned;

    } catch (e) {
      setError('OCR failed. Try a clearer image.');
      setIsLoading(false);
      return '';
    }
  };

  return { extractText, progress, isLoading, error };
}