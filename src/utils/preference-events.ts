/**
 * preference-events.ts
 * Event system for real-time preference updates
 * Allows components to listen for preference changes
 */

export class PreferenceEventEmitter extends EventTarget {
  private static instance: PreferenceEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): PreferenceEventEmitter {
    if (!PreferenceEventEmitter.instance) {
      PreferenceEventEmitter.instance = new PreferenceEventEmitter();
    }
    return PreferenceEventEmitter.instance;
  }

  emitPreferenceUpdate(detail?: any) {
    // Emit preference update event to all listeners
    const event = new CustomEvent('preferenceUpdate', { detail });
    this.dispatchEvent(event);
  }

  onPreferenceUpdate(callback: (event: CustomEvent) => void) {
    this.addEventListener('preferenceUpdate', callback as EventListener);
    return () => {
      this.removeEventListener('preferenceUpdate', callback as EventListener);
    };
  }
}

// Global instance for easy access
export const preferenceEvents = PreferenceEventEmitter.getInstance();

// Also expose as window event for cross-component communication
if (typeof window !== 'undefined') {
  (window as any).emitPreferenceUpdate = (detail?: any) => {
    preferenceEvents.emitPreferenceUpdate(detail);
  };
}