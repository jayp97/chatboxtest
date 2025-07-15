/**
 * usePreferenceUpdates.ts
 * Hook to detect and emit preference updates from chat messages
 */

import { useEffect, useRef } from 'react';
import { notifyPreferenceUpdate } from '@/utils/preference-updater';

interface UsePreferenceUpdatesOptions {
  enabled?: boolean;
}

export function usePreferenceUpdates(options: UsePreferenceUpdatesOptions = {}) {
  const { enabled = true } = options;
  const lastMessageRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    // Function to check if a message indicates preference update
    const checkForPreferenceUpdate = (message: string) => {
      const lowerMessage = message.toLowerCase();
      
      // Check for preference update indicators
      const updateIndicators = [
        'updated your favourite',
        'saved your preference',
        'noted that your favourite',
        'i\'ll remember',
        'preference has been updated',
        'favourite country is now',
        'favourite city is now',
        'favourite destination is now',
        '✅ preferences updated',
        'preferences saved'
      ];

      return updateIndicators.some(indicator => lowerMessage.includes(indicator));
    };

    // Set up MutationObserver to watch for new chat messages
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const text = element.textContent || '';
              
              // Skip if this is the same message we already processed
              if (text === lastMessageRef.current) return;
              
              // Check if this looks like a bot response with preference update
              if (checkForPreferenceUpdate(text)) {
                console.log('🎯 Detected preference update in chat:', text.substring(0, 100));
                lastMessageRef.current = text;
                
                // Emit update event
                notifyPreferenceUpdate({
                  source: 'chat-detection',
                  message: text.substring(0, 200),
                  timestamp: new Date().toISOString()
                });
              }
            }
          });
        }
      });
    });

    // Start observing the document for chat messages
    if (typeof document !== 'undefined') {
      // Look for chat container or body
      const chatContainer = document.querySelector('[data-chat-container]') || 
                          document.querySelector('.chat-messages') || 
                          document.body;
      
      observer.observe(chatContainer, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [enabled]);

  // Manual trigger function
  const triggerUpdate = (preferences?: Record<string, unknown>) => {
    notifyPreferenceUpdate({
      source: 'manual',
      preferences,
      timestamp: new Date().toISOString()
    });
  };

  return { triggerUpdate };
}