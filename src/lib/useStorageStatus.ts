import { useSyncExternalStore } from 'react';
import { subscribeStorageStatus, getStorageStatus } from './storage';
export function useStorageStatus() {return useSyncExternalStore(subscribeStorageStatus,getStorageStatus,() => 'ok' as const);}
