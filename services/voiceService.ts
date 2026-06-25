type VoiceProfile = 'valentina' | 'mateo' | 'agustina';

export const voiceService = {
  async speak(text: string, voiceProfile: VoiceProfile = 'mateo'): Promise<void> {
    try {
      // Intento primario: Kokoro-FastAPI (vía nuestro propio Proxy backend)
      console.log(`[VoiceService] Intentando Kokoro local/remoto`);
      const kokoroResponse = await fetch('/api/kokoro/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text,
            voiceProfile
        })
      });

      if (kokoroResponse.ok) {
         console.log('[VoiceService] Kokoro TTS Exitoso!');
         await playBlob(await kokoroResponse.blob());
         return;
      } else {
         console.warn('[VoiceService] Kokoro no está corriendo o falló:', await kokoroResponse.text());
         throw new Error('Kokoro TTS unavailable');
      }
    } catch (e) {
      console.warn('[VoiceService] Fetch a Kokoro falló:', (e as Error).message);
    }

    try {
      // Fallback 1: Piper TTS (Local/Remoto)
      console.log(`[VoiceService] Intentando Piper TTS (Fallback)`);
      const piperResponse = await fetch('/api/piper/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text,
            voiceProfile
        })
      });

      if (piperResponse.ok) {
         console.log('[VoiceService] Piper TTS Exitoso!');
         await playBlob(await piperResponse.blob());
         return;
      } else {
         console.warn('[VoiceService] Piper no está corriendo o falló:', await piperResponse.text());
         throw new Error('Piper TTS unavailable');
      }
    } catch (e) {
      console.warn('[VoiceService] Fetch a Piper falló:', (e as Error).message);
    }

    try {
      // Fallback 2: ElevenLabs (Opcional)
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceProfile })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('[VoiceService] ElevenLabs Error:', errData.error || response.statusText);
        throw new Error('ElevenLabs TTS unavailable');
      }

      await playBlob(await response.blob());
    } catch (error) {
      // Fallback final: Navegador Nativo
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

async function playBlob(blob: Blob): Promise<void> {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = (e) => {
         console.info('[VoiceService] Audio playback error.', e);
         resolve(); 
      };
      audio.play().catch(e => {
          console.info('[VoiceService] Play blocked by browser, ignoring.', e);
          resolve();
      });
    });
}
