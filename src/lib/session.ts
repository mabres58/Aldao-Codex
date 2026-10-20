import type { Empleado, Sesion } from '../types/index.ts';
import { getItem, setItem, removeItem, STORAGE_KEYS } from './storage.ts';
export const SESSION_KEY = 'aldao_session';
const listeners = new Set<() => void>();
let revision = 0;
let initialized = false;
let tabSession: Sesion | null = null;
export const subscribeSession = (listener: () => void) => {listeners.add(listener);return () => {listeners.delete(listener);};};
export const getSessionRevision = () => revision;
export function refreshSession() {revision++;listeners.forEach(listener => listener());}
export function readEmployees(): Empleado[] {
  const result = getItem<Empleado[]>(STORAGE_KEYS.employees);
  return result.ok && Array.isArray(result.value) ? result.value.filter(row => row && typeof row.id === 'string' && typeof row.nombre === 'string' && typeof row.area === 'string') : [];
}
function validateSession(input: unknown): Sesion | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Partial<Sesion>;
  if (typeof value.timestamp !== 'string' || !Number.isFinite(Date.parse(value.timestamp))) return null;
  if (value.rol === 'admin' && value.employeeId === null) return value as Sesion;
  if (value.rol === 'empleado' && typeof value.employeeId === 'string' && readEmployees().some(employee => employee.id === value.employeeId)) return value as Sesion;
  return null;
}
export function readSavedSession(): Sesion | null {const result = getItem<unknown>(SESSION_KEY);return result.ok ? validateSession(result.value) : null;}
export function readSession(): Sesion | null {
  if (!initialized) {initialized = true;tabSession = readSavedSession();}
  return validateSession(tabSession);
}
export function startSession(session: Sesion) {
  const result = setItem(SESSION_KEY,session);
  if (result.ok) {initialized = true;tabSession = session;refreshSession();}
  return result;
}
export function endSession() {
  const result = removeItem(SESSION_KEY);
  if (result.ok) {initialized = true;tabSession = null;refreshSession();}
  return result;
}
