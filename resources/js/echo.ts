import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
      Pusher: any;
    }
  }
  

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
});

export default echo;
