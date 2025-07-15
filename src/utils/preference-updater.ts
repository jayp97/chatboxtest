/**
 * preference-updater.ts
 * Utility to update preferences and emit events for real-time updates
 */

import { preferenceEvents } from './preference-events';

/**
 * Call this function after updating preferences in memory
 * to notify all listening components (like the globe)
 */
export function notifyPreferenceUpdate(preferences?: Record<string, unknown>) {
  // Notify all components of preference update
  
  // Emit the event
  preferenceEvents.emitPreferenceUpdate(preferences);
  
  // Also emit as window event for broader compatibility
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('preferenceUpdate', { detail: preferences }));
  }
}

// Export as global for easy access from console or other scripts
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).notifyPreferenceUpdate = notifyPreferenceUpdate;
}