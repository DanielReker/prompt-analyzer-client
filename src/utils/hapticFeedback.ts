export const hapticFeedback = {
    light: () => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    },
    
    medium: () => {
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    },
    
    heavy: () => {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    },
    
    success: () => {
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    },
    
    error: () => {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };