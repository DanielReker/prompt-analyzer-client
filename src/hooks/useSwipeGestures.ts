import { useRef, useState } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance for swipe
  preventDefaultTouchmove?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

export const useSwipeGestures = (config: SwipeConfig) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmove = false,
  } = config;

  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null; // Reset end position
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (preventDefaultTouchmove) {
      e.preventDefault();
    }
    
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) {
      setIsSwiping(false);
      return;
    }

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    // Determine if it's more horizontal or vertical
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }

    setIsSwiping(false);
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping,
  };
};

// Enhanced hook with visual feedback
export const useSwipeGesturesWithFeedback = (config: SwipeConfig & {
  showVisualFeedback?: boolean;
  hapticFeedback?: boolean;
}) => {
  const swipeProps = useSwipeGestures(config);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);

  const touchStart = useRef<TouchPosition | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    swipeProps.onTouchStart(e);
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    setSwipeDirection(null);
    setSwipeDistance(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    swipeProps.onTouchMove(e);
    
    if (!touchStart.current || !config.showVisualFeedback) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const distanceX = touchStart.current.x - currentX;
    const distanceY = touchStart.current.y - currentY;
    
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontal) {
      if (distanceX > 20) {
        setSwipeDirection('left');
        setSwipeDistance(Math.min(distanceX, 100));
      } else if (distanceX < -20) {
        setSwipeDirection('right');
        setSwipeDistance(Math.min(Math.abs(distanceX), 100));
      }
    } else {
      if (distanceY > 20) {
        setSwipeDirection('up');
        setSwipeDistance(Math.min(distanceY, 100));
      } else if (distanceY < -20) {
        setSwipeDirection('down');
        setSwipeDistance(Math.min(Math.abs(distanceY), 100));
      }
    }
  };

  const onTouchEnd = () => {
    swipeProps.onTouchEnd();
    
    // Trigger haptic feedback
    if (config.hapticFeedback && swipeDirection && swipeDistance > (config.threshold || 50)) {
      if (navigator.vibrate) {
        navigator.vibrate(30); // Light haptic feedback
      }
    }
    
    // Reset visual feedback after delay
    setTimeout(() => {
      setSwipeDirection(null);
      setSwipeDistance(0);
    }, 200);
  };

  return {
    ...swipeProps,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swipeDirection,
    swipeDistance,
  };
};