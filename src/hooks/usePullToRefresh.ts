import { useEffect, useRef, useState, useCallback } from 'react';

interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number; // Minimum distance to trigger refresh
  maxDistance?: number; // Maximum pull distance
  resistance?: number; // Resistance factor (0-1)
  enabled?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

export const usePullToRefresh = (config: PullToRefreshConfig) => {
  const {
    onRefresh,
    threshold = 80,
    maxDistance = 120,
    resistance = 0.6,
    enabled = true,
  } = config;

  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canPull, setCanPull] = useState(false);

  const touchStart = useRef<TouchPosition | null>(null);
  const startScrollTop = useRef<number>(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const checkScrollTop = useCallback(() => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollTop <= 0;
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing) return;

    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    
    startScrollTop.current = containerRef.current?.scrollTop || 0;
    setCanPull(checkScrollTop());
  }, [enabled, isRefreshing, checkScrollTop]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing || !touchStart.current || !canPull) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStart.current.y;
    
    // Only allow pulling down
    if (deltaY <= 0) {
      setPullDistance(0);
      setIsPulling(false);
      return;
    }

    // Check if we're still at the top
    if (!checkScrollTop()) {
      setCanPull(false);
      setPullDistance(0);
      setIsPulling(false);
      return;
    }

    // Prevent default scrolling when pulling
    if (deltaY > 10) {
      e.preventDefault();
    }

    // Calculate pull distance with resistance
    const resistedDistance = Math.min(
      deltaY * resistance,
      maxDistance
    );

    setPullDistance(resistedDistance);
    setIsPulling(resistedDistance > 20);
  }, [enabled, isRefreshing, canPull, checkScrollTop, resistance, maxDistance]);

  const onTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing || !isPulling) {
      setPullDistance(0);
      setIsPulling(false);
      setCanPull(false);
      return;
    }

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setIsPulling(false);
    setCanPull(false);
    touchStart.current = null;
  }, [enabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

  // Reset states when refresh completes
  useEffect(() => {
    if (!isRefreshing) {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isRefreshing]);

  const getRefreshState = () => {
    if (isRefreshing) return 'refreshing';
    if (pullDistance >= threshold) return 'ready';
    if (isPulling) return 'pulling';
    return 'idle';
  };

  const getProgressPercentage = () => {
    return Math.min((pullDistance / threshold) * 100, 100);
  };

  return {
    // Touch handlers
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    
    // State
    isPulling,
    isRefreshing,
    pullDistance,
    canPull,
    
    // Computed values
    refreshState: getRefreshState(),
    progressPercentage: getProgressPercentage(),
    
    // Refs
    containerRef,
  };
};

// Enhanced hook with visual feedback
export const usePullToRefreshWithFeedback = (config: PullToRefreshConfig & {
  showVisualFeedback?: boolean;
  customMessages?: {
    pulling?: string;
    ready?: string;
    refreshing?: string;
  };
}) => {
  const pullToRefreshProps = usePullToRefresh(config);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const defaultMessages = {
    pulling: 'Pull to refresh...',
    ready: 'Release to refresh!',
    refreshing: 'Refreshing...',
    ...config.customMessages,
  };

  useEffect(() => {
    const { refreshState } = pullToRefreshProps;
    
    if (config.showVisualFeedback) {
      switch (refreshState) {
        case 'pulling':
          setFeedbackMessage(defaultMessages.pulling);
          setShowFeedback(true);
          break;
        case 'ready':
          setFeedbackMessage(defaultMessages.ready);
          setShowFeedback(true);
          break;
        case 'refreshing':
          setFeedbackMessage(defaultMessages.refreshing);
          setShowFeedback(true);
          break;
        default:
          setShowFeedback(false);
          break;
      }
    }
  }, [pullToRefreshProps.refreshState, config.showVisualFeedback, defaultMessages]);

  return {
    ...pullToRefreshProps,
    showFeedback,
    feedbackMessage,
  };
};