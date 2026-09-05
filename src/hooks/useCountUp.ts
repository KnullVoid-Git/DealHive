import { useState, useEffect } from 'react';

/**
 * Custom hook to animate a numerical target count up from 0 to its value.
 * Animates in 700ms using ease-out (decelerating as it reaches target) per Section 12.
 */
export const useCountUp = (target: number, duration: number = 700) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration;
    const incrementTime = 16; // ~60fps
    const totalSteps = totalMiliseconds / incrementTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // standard ease-out function
      const progress = currentStep / totalSteps;
      const easeOutProgress = 1 - Math.pow(1 - progress, 2);
      const nextCount = Math.floor(easeOutProgress * end);
      
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(nextCount);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
};
export default useCountUp;
