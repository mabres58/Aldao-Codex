import type { Solicitud } from '../types/index.ts';
import { getItem, setItem, STORAGE_KEYS } from './storage.ts';
import type { StorageResult } from './storage.ts';
import { readSession } from './session.ts';

export const REQUEST_TYPES = ['Licencia / día libre', 'Equipo de seguridad', 'Horas extra'] as const;
export interface RequestDraft { tipo: string; detalle: string; fecha: string }
export type RequestErrors = Partial<Record<keyof RequestDraft, string>>;
export const SAVE_ERROR = 'No se pudo guardar la solicitud: el almacenamiento no está disponible. Intentá nuevamente.';
export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function validateDraft(draft: RequestDraft): RequestErrors {
  const errors: RequestErrors = {};
  if (!REQUEST_TYPES.includes(draft.tipo as Solicitud['tipo'])) errors.tipo = 'Seleccioná un tipo de solicitud.';
  if (draft.detalle.trim().length < 5) errors.detalle = 'Escribí un detalle válido (no puede estar vacío).';
  if (!isValidDate(draft.fecha)) errors.fecha = 'Seleccioná una fecha.';
  return errors;
}
function isRequest(value: unknown): value is Solicitud {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<Solicitud>;
  return typeof row.id === 'string' && typeof row.employeeId === 'string' && REQUEST_TYPES.includes(row.tipo as Solicitud['tipo']) && typeof row.detalle === 'string' && typeof row.fecha === 'string' && isValidDate(row.fecha) && ['Pendiente','Aprobada','Rechazada'].includes(row.estado ?? '') && typeof row.fechaCreacion === 'string' && Number.isFinite(Date.parse(row.fechaCreacion)) && (row.fechaResolucion === null || (typeof row.fechaResolucion === 'string' && Number.isFinite(Date.parse(row.fechaResolucion))));
}
export function readRequests(): StorageResult<Solicitud[]> {
  const result = getItem<unknown>(STORAGE_KEYS.requests);
  if (!result.ok) return result;
  if (!Array.isArray(result.value) || !result.value.every(isRequest)) return {ok:false,error:'No se pudieron leer las solicitudes guardadas. Revisá los datos locales antes de continuar.'};
  return {ok:true,value:result.value};
}
export function ownRequests(rows: Solicitud[], employeeId: string): Solicitud[] {
  return rows.filter(row => row.employeeId === employeeId).sort((a,b) => Date.parse(b.fechaCreacion) - Date.parse(a.fechaCreacion));
}
export function saveRequest(draft: RequestDraft, employeeId: string): StorageResult<Solicitud[]> {
  if (Object.keys(validateDraft(draft)).length) return {ok:false,error:'Revisá los campos de la solicitud.'};
  const session = readSession();
  if (session?.rol !== 'empleado' || session.employeeId !== employeeId) return {ok:false,error:'Tu sesión no es válida. Volvé a ingresar para enviar la solicitud.'};
  const current = readRequests();
  if (!current.ok) return {ok:false,error:SAVE_ERROR};
  const request: Solicitud = {
    id:crypto.randomUUID(),employeeId,tipo:draft.tipo as Solicitud['tipo'],detalle:draft.detalle.trim(),fecha:draft.fecha,
    estado:'Pendiente',fechaCreacion:new Date().toISOString(),fechaResolucion:null,
  };
  const rows = [...current.value,request];
  const result = setItem(STORAGE_KEYS.requests,rows);
  return result.ok ? {ok:true,value:rows} : {ok:false,error:SAVE_ERROR};
}
