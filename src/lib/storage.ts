import { employees, createRequests } from './seed.ts';
export const STORAGE_KEYS = {employees:'aldao_employees',requests:'aldao_requests',seededAt:'aldao_seeded_at',anchorDate:'aldao_anchor_date'} as const;
export type StorageResult<T> = {ok:true;value:T} | {ok:false;error:string};
let status: 'ok' | 'error' = 'ok';
let startupUnavailable = false;
// Simulación de arranque solo para verificar desarrollo; nunca se persiste.
export function simulateStartupUnavailable(value: boolean) {startupUnavailable = value;}
let simulatedBlocked = false;
const simulationListeners = new Set<() => void>();
export const getSimulatedBlocked = () => simulatedBlocked;
export const subscribeSimulation = (listener: () => void) => {simulationListeners.add(listener);return () => {simulationListeners.delete(listener);};};
let simulationChannel: BroadcastChannel | null = null;
function updateSimulation(value: boolean) {simulatedBlocked = value;simulationListeners.forEach(listener => listener());}
export function setSimulatedBlocked(value: boolean) {updateSimulation(value);simulationChannel?.postMessage({blocked:value});}
const listeners = new Set<() => void>();
export const getStorageStatus = () => status;
export const subscribeStorageStatus = (listener: () => void) => {listeners.add(listener);return () => {listeners.delete(listener);};};
function setStatus(value: 'ok' | 'error') {if (status !== value) {status = value;listeners.forEach(listener => listener());}}
export function storageFailure(error: unknown): {ok:false;error:string} {
  setStatus('error');
  return {ok:false,error:error instanceof Error ? error.message : 'No se pudo acceder al almacenamiento.'};
}
export function getItem<T>(key: string): StorageResult<T | null> {
  try {if(startupUnavailable) throw new Error('Almacenamiento no disponible desde el arranque');const raw = localStorage.getItem(key);return {ok:true,value:raw === null ? null : JSON.parse(raw) as T};}
  catch(error) {return storageFailure(error);}
}
export function setItem<T>(key: string, value: T): StorageResult<T> {
  try {if (startupUnavailable || simulatedBlocked) throw new Error('Almacenamiento bloqueado para pruebas');localStorage.setItem(key,JSON.stringify(value));setStatus('ok');return {ok:true,value};}
  catch(error) {return storageFailure(error);}
}
export function removeItem(key: string): StorageResult<null> {
  try {if (startupUnavailable || simulatedBlocked) throw new Error('Almacenamiento bloqueado para pruebas');localStorage.removeItem(key);return {ok:true,value:null};}
  catch(error) {return storageFailure(error);}
}
export function getAnchorDate(): StorageResult<number> {
  const result = getItem<number>(STORAGE_KEYS.anchorDate);
  if (!result.ok) return result;
  if (result.value !== null) {
    if (typeof result.value !== 'number' || !Number.isFinite(result.value) || Number.isNaN(new Date(result.value).getTime())) return storageFailure(new Error('Fecha de inicio guardada inválida.'));
    return {ok:true,value:result.value};
  }
  return setItem(STORAGE_KEYS.anchorDate,Date.now());
}
export function seedIfEmpty(): StorageResult<boolean> {
  const savedEmployees = getItem(STORAGE_KEYS.employees);
  const savedRequests = getItem(STORAGE_KEYS.requests);
  if (!savedEmployees.ok) return savedEmployees;
  if (!savedRequests.ok) return savedRequests;
  const anchor = getAnchorDate();
  if (!anchor.ok) return anchor;
  let seeded = false;
  for (const [key, current, initial] of [
    [STORAGE_KEYS.employees,savedEmployees.value,employees],
    [STORAGE_KEYS.requests,savedRequests.value,createRequests(anchor.value)],
  ] as const) {
    if (current === null) {const result = setItem(key,initial);if (!result.ok) return result;seeded = true;}
  }
  const timestamp = getItem(STORAGE_KEYS.seededAt);
  if (!timestamp.ok) return timestamp;
  if (seeded && timestamp.value === null) {const result = setItem(STORAGE_KEYS.seededAt,new Date().toISOString());if (!result.ok) return result;}
  return {ok:true,value:seeded};
}
const dataListeners = new Set<() => void>();
export const subscribeData = (listener: () => void) => {dataListeners.add(listener);return () => {dataListeners.delete(listener);};};
export function handleStorageEvent(event: Pick<StorageEvent,'key' | 'storageArea'>) {
  try {if (event.storageArea && event.storageArea !== localStorage) return;}
  catch(error) {storageFailure(error);return;}
  if (event.key === STORAGE_KEYS.requests || event.key === STORAGE_KEYS.employees || event.key === null) dataListeners.forEach(listener => listener());
  // aldao_session no reemplaza la sesión de esta pestaña ni fuerza cierre local.
}
export function startStorageSync(): () => void {
  window.addEventListener('storage',handleStorageEvent);
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      simulationChannel = new BroadcastChannel('aldao_demo_storage_test');
      simulationChannel.onmessage = event => {if (typeof event.data?.blocked === 'boolean') updateSimulation(event.data.blocked);};
    } catch {simulationChannel = null;}
  }
  return () => {window.removeEventListener('storage',handleStorageEvent);simulationChannel?.close();simulationChannel = null;};
}
export async function withDataLock<T>(operation: () => T | Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request('aldao_data_write',operation);
  return operation();
}
