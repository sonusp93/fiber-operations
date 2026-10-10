import React, { useRef, useEffect, useCallback } from 'react';

interface SwipeBackGestureProps {
  canGoBack: boolean;
  onBack: () => void;
  children: React.ReactNode;
  isLightMode?: boolean;
}

type SwipeSide = 'left' | 'right';

export const SwipeBackGesture: React.FC<SwipeBackGestureProps> = ({
  canGoBack,
  onBack,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    isValidStart: boolean;
    side: SwipeSide;
  } | null>(null);

  const isTriggeredRef = useRef(false);

  const handleStart = useCallback((clientX: number, clientY: number, target: EventTarget | null) => {
    if (!canGoBack) return;

    // Ignore range inputs / sliders
    const element = target as HTMLElement | null;
    if (element?.closest('input[type="range"]')) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const relativeX = rect ? clientX - rect.left : clientX;
    const containerWidth = rect?.width || window.innerWidth;

    // Edge gesture zone: Left 30% or Right 30% of screen
    const isLeftEdge = relativeX <= containerWidth * 0.30;
    const isRightEdge = relativeX >= containerWidth * 0.70;

    if (!isLeftEdge && !isRightEdge) {
      touchStartRef.current = null;
      return;
    }

    const side: SwipeSide = isLeftEdge ? 'left' : 'right';

    touchStartRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
      isValidStart: true,
      side
    };
    isTriggeredRef.current = false;
  }, [canGoBack]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!touchStartRef.current || !touchStartRef.current.isValidStart) return;

    const { x: startX, y: startY, side } = touchStartRef.current;
    const rawDeltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Inward horizontal movement
    const effectiveInwardDelta = side === 'left' ? rawDeltaX : -rawDeltaX;

    if (effectiveInwardDelta <= 2) return;

    // Cancel ONLY if vertical motion is 3x greater than horizontal inward motion
    if (Math.abs(deltaY) > effectiveInwardDelta * 3.0 && effectiveInwardDelta < 15) {
      touchStartRef.current.isValidStart = false;
    }
  }, []);

  const handleEnd = useCallback((clientX: number) => {
    if (!touchStartRef.current || !touchStartRef.current.isValidStart) {
      touchStartRef.current = null;
      return;
    }

    const { x: startX, time: startTime, side } = touchStartRef.current;
    const rawDeltaX = clientX - startX;
    const effectiveInwardDelta = side === 'left' ? rawDeltaX : -rawDeltaX;
    const duration = Date.now() - startTime;
    const velocity = effectiveInwardDelta / Math.max(1, duration); // px/ms

    // Trigger back if moved > 25px inward OR fast swipe
    if (
      canGoBack &&
      !isTriggeredRef.current &&
      (effectiveInwardDelta > 25 || velocity > 0.20)
    ) {
      isTriggeredRef.current = true;
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate(18);
        }
      } catch {
        // Ignore haptic errors
      }
      onBack();
    }

    touchStartRef.current = null;
  }, [canGoBack, onBack]);

  // Touch Event Listeners for Native Phone Back Swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        handleEnd(e.changedTouches[0].clientX);
      }
    };

    const onTouchCancel = () => {
      touchStartRef.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [handleStart, handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col overflow-hidden"
    >
      {children}
    </div>
  );
};
