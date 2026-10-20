import type { Empleado, Solicitud } from '../types/index.ts';
import { readRequests } from './requests.ts';
import { readSession } from './session.ts';
import { setItem, STORAGE_KEYS, withDataLock } from './storage.ts';

export interface AdminFilters { employeeId: string; tipo: string; fecha: string }
export const EMPTY_FILTERS: AdminFilters = { employeeId:'', tipo:'', fecha:'' };
export function filterRequests(rows: Solicitud[], filters: AdminFilters): Solicitud[] {
  return rows.filter(row => (!filters.employeeId || row.employeeId === filters.employeeId) && (!filters.tipo || row.tipo === filters.tipo) && (!filters.fecha || row.fecha === filters.fecha));
}
export function countRequests(rows: Solicitud[]) {
  return {Pendiente:rows.filter(row => row.estado === 'Pendiente').length,Aprobada:rows.filter(row => row.estado === 'Aprobada').length,Rechazada:rows.filter(row => row.estado === 'Rechazada').length};
}
export function pendingRequests(rows: Solicitud[]) {
  return rows.filter(row => row.estado === 'Pendiente').sort((a,b) => a.fecha.localeCompare(b.fecha) || a.fechaCreacion.localeCompare(b.fechaCreacion));
}
export function resolvedRequests(rows: Solicitud[]) {
  return rows.filter(row => row.estado !== 'Pendiente').sort((a,b) => Date.parse(b.fechaResolucion ?? '') - Date.parse(a.fechaResolucion ?? ''));
}
export function findConflicts(request: Solicitud, rows: Solicitud[], employees: Empleado[]) {
  if (request.tipo !== 'Licencia / día libre' || request.estado === 'Rechazada') return [];
  const current = employees.find(row => row.id === request.employeeId);
  return rows.filter(row => row.id !== request.id && row.employeeId !== request.employeeId && row.tipo === 'Licencia / día libre' && row.fecha === request.fecha && (row.estado === 'Pendiente' || row.estado === 'Aprobada')).map(row => {
    const employee = employees.find(employee => employee.id === row.employeeId);
    return {request:row,employee,sameArea:!!current && !!employee && current.area === employee.area};
  });
}
type ResolutionResult = {ok:true;rows:Solicitud[]} | {ok:false;error:string;rows?:Solicitud[]};
const inFlight = new Set<string>();
export async function resolveRequestSafely(id: string, estado: 'Aprobada' | 'Rechazada', isActive: () => boolean = () => true): Promise<ResolutionResult> {
  if (inFlight.has(id)) return {ok:false,error:'Esta solicitud ya se está procesando.'};
  inFlight.add(id);
  try {return await withDataLock(() => isActive() ? resolveRequest(id,estado) : {ok:false,error:'Acción cancelada al salir del panel.'});}
  finally {inFlight.delete(id);}
}
export function resolveRequest(id: string, estado: 'Aprobada' | 'Rechazada'): ResolutionResult {
  if (readSession()?.rol !== 'admin') return {ok:false,error:'Tu sesión de administración no es válida. Volvé a ingresar.'};
  const current = readRequests();
  if (!current.ok) return {ok:false,error:'No se pudo guardar la resolución: el almacenamiento no está disponible. Intentá nuevamente.'};
  const request = current.value.find(row => row.id === id);
  if (!request) return {ok:false,error:'No se encontró la solicitud. Actualizá la página.'};
  if (request.estado !== 'Pendiente') return {ok:false,error:'Esta solicitud ya fue resuelta.',rows:current.value};
  const rows = current.value.map(row => row.id === id ? {...row,estado,fechaResolucion:new Date().toISOString()} : row);
  const result = setItem(STORAGE_KEYS.requests,rows);
  return result.ok ? {ok:true,rows} : {ok:false,error:'No se pudo guardar la resolución: el almacenamiento no está disponible. Intentá nuevamente.'};
}
