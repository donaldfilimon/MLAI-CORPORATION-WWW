import { useState, useEffect, useRef } from 'react';

export function useAutoSave<T>(data: T, key: string, delay: number = 3000) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Skip initial save
    if (status === 'idle') {
      setStatus('saved');
      return;
    }

    setStatus('saving');

    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data));
      setStatus('saved');
    }, delay);

    return () => clearTimeout(timeoutRef.current);
  }, [data, key, delay]);

  return status;
}
