type VoiceProfile = 'valentina' | 'mateo' | 'agustina';

export const voiceService = {
  async speak(text: string, voiceProfile: VoiceProfile = 'mateo'): Promise<void> {
    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceProfile })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = (e) => reject(e);
        audio.play().catch(reject);
      });
    } catch (error) {
      console.warn('ElevenLabs TTS failed, falling back to Web Speech API', error);
      return new Promise((resolve, reject) => {
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
          utterance.onerror = (e) => reject(e);
          window.speechSynthesis.speak(utterance);
        } else {
          resolve(); // Fallback resolving if neither works
        }
      });
    }
  }
};
