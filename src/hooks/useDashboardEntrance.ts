import { useEffect } from 'react';

/**
 * Custom hook to stagger the load sequence of dashboard elements.
 * Elements with specific animated classes are staggered via inline transition-delays.
 */
export const useDashboardEntrance = () => {
  useEffect(() => {
    // Select all elements designed to load staggered
    const animElements = document.querySelectorAll('.animate-stagger-item');
    
    animElements.forEach((el, idx) => {
      const htmlEl = el as HTMLElement;
      // Stagger spacing by 80ms increments per Section 12
      const delay = idx * 80;
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(12px)';
      htmlEl.style.transition = `opacity 250ms cubic-bezier(0, 0, 0.2, 1), transform 250ms cubic-bezier(0, 0, 0.2, 1)`;
      
      setTimeout(() => {
        htmlEl.style.opacity = '1';
        htmlEl.style.transform = 'translateY(0)';
      }, delay);
    });
  }, []);
};
export default useDashboardEntrance;
