'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/data/products';

interface AnimatedPriceProps {
  value: number;
}

export default function AnimatedPrice({ value }: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 400; // Shorter duration for snappier feel
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad formula for a smoother stop
      const ease = 1 - Math.pow(1 - progress, 4);
      const newDisplayValue = start + (end - start) * ease;

      setDisplayValue(newDisplayValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end); // Ensure it ends on the exact value
      }
    };

    const frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{formatPrice(displayValue)}</>;
}
