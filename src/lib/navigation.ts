import { useSyncExternalStore } from 'react';
export function navigate(path: string, replace = false) {
  window.history[replace ? 'replaceState' : 'pushState'](null,'',path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0,0);
}
const subscribe = (listener: () => void) => {window.addEventListener('popstate',listener);return () => window.removeEventListener('popstate',listener);};
export function usePathname() {return useSyncExternalStore(subscribe,() => window.location.pathname,() => '/empresa');}
