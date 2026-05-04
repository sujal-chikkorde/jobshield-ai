import { createWorker } from 'tesseract.js';
import { useState } from 'react';

export function useOCR() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const extractText = async (imageFile) => {
    setIsLoading(true);
    setProgress(0);
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();
      setIsLoading(false);
      setProgress(100);
      return text;
    } catch(e) {
      setIsLoading(false);
      return '';
    }
  };

  return { extractText, progress, isLoading };
}