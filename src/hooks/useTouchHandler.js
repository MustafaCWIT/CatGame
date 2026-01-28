import { useCallback, useRef } from 'react';

export function useTouchHandler(onTouch) {
  const processedTouches = useRef(new Set());
  const lastTouchTime = useRef(0);
  const lastTouchPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const now = Date.now();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchId = touch.identifier;
      
      // Skip if this touch was already processed
      if (processedTouches.current.has(touchId)) continue;
      
      const x = touch.clientX;
      const y = touch.clientY;
      
      // Debounce: ignore if same position within 200ms
      const timeDiff = now - lastTouchTime.current;
      const dist = Math.hypot(x - lastTouchPos.current.x, y - lastTouchPos.current.y);
      
      if (timeDiff < 200 && dist < 20) {
        continue; // Ignore duplicate touch
      }
      
      processedTouches.current.add(touchId);
      lastTouchTime.current = now;
      lastTouchPos.current = { x, y };
      onTouch(x, y);
    }
  }, [onTouch]);

  const handleTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      processedTouches.current.delete(e.changedTouches[i].identifier);
    }
  }, []);

  // Mouse fallback for development
  const handleMouseDown = useCallback((e) => {
    const now = Date.now();
    const x = e.clientX;
    const y = e.clientY;
    
    // Debounce mouse clicks too
    const timeDiff = now - lastTouchTime.current;
    const dist = Math.hypot(x - lastTouchPos.current.x, y - lastTouchPos.current.y);
    
    if (timeDiff < 200 && dist < 20) {
      return; // Ignore duplicate click
    }
    
    lastTouchTime.current = now;
    lastTouchPos.current = { x, y };
    onTouch(x, y);
  }, [onTouch]);

  return { handleTouchStart, handleTouchEnd, handleMouseDown };
}
