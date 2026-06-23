
import { voiceService } from './voiceService';

export const notificationService = {
  requestPermission: async () => {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  },

  playAlert: (type: 'success' | 'alert' | 'info' = 'info') => {
    const sounds = {
      success: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
      alert: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
      info: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.play().catch(e => console.log('Audio feedback disabled by browser policy'));
  },

  notify: (title: string, body: string, readOutLoud: boolean = true) => {
    notificationService.playAlert('info');
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'
      });
    }
    
    if (readOutLoud) {
       // Fire and forget TTS
       voiceService.speak(`${title}. ${body}`).catch(() => {});
    }
  }
};
