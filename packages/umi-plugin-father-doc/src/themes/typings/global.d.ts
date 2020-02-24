import { History } from 'history';

declare global {
  interface Window {
    g_history: History;
  }
}
