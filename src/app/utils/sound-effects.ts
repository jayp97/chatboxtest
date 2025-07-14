/**
 * sound-effects.ts
 * Sound effect utilities
 * Handles terminal sounds and audio feedback
 */

export class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play a typing sound
   */
  playTyping() {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  /**
   * Play a boot sequence beep
   */
  playBootBeep() {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.2;
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * Toggle sound effects on/off
   */
  toggle() {
    this.enabled = !this.enabled;
  }
}

export const soundEffects = new SoundEffects();