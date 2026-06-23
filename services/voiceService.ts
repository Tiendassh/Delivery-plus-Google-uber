type VoiceProfile = 'valentina' | 'mateo' | 'agustina';

export const voiceService = {
  async speak(text: string, voiceProfile: VoiceProfile = 'mateo'): Promise<void> {
    try {
      // Make a call to Azure via proxy. We switch from /api/elevenlabs/tts to /api/azure/tts
      const response = await fetch('/api/azure/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceProfile })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('[VoiceService] Azure Error:', errData.error || response.statusText);
        throw new Error('Azure TTS unavailable');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = (e) => {
           console.info('[VoiceService] Audio playback error.', e);
           resolve(); // Resolve anyway to not break the flow
        };
        audio.play().catch(e => {
            console.info('[VoiceService] Play blocked by browser, ignoring.', e);
            resolve();
        });
      });
    } catch (error) {
      // Fallback
      return new Promise((resolve) => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'es-AR';
          
          if (voiceProfile === 'valentina' || voiceProfile === 'agustina') {
            utterance.pitch = 1.3;
            utterance.rate = 1.05;
          } else {
            utterance.pitch = 0.8;
            utterance.rate = 1.0;
          }

          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        } else {
          resolve(); // Fallback resolving if neither works
        }
      });
    }
  }
};
