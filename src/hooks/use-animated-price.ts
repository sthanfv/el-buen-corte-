'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/data/products';

export function useAnimatedPrice(value: number) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // Ease-out quart

      const newDisplayValue = start + (end - start) * ease;
      setDisplayValue(newDisplayValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end); // Ensure it ends on the exact value
      }
    };

    requestAnimationFrame(animate);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return formatPrice(displayValue);
}
