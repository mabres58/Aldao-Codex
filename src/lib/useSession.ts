import { useSyncExternalStore } from 'react';
import { getSessionRevision, readSession, subscribeSession } from './session';
export function useSession() {
  useSyncExternalStore(subscribeSession,getSessionRevision,() => 0);
  return readSession();
}
