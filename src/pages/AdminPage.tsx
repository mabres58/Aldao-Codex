import { useEffect, useRef, useState } from 'react';
import type { Solicitud } from '../types';
import { readEmployees } from '../lib/session';
import { REQUEST_TYPES } from '../lib/requests';
import { countRequests, EMPTY_FILTERS, filterRequests, findConflicts, pendingRequests, resolvedRequests, resolveRequestSafely } from '../lib/admin';
import type { AdminFilters } from '../lib/admin';
import { useRequestsSync } from '../lib/useRequestsSync';

function dateLabel(value: string, withTime = false) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (!Number.isFinite(date.getTime())) return 'Sin fecha registrada';
  return new Intl.DateTimeFormat('es-UY',{day:'2-digit',month:'2-digit',year:'numeric',...(withTime && value.length > 10 ? {hour:'2-digit',minute:'2-digit',timeZone:'America/Montevideo'} as const : {timeZone:'UTC'})}).format(date);
}
const statusClass = {Pendiente:'bg-amber/20 text-ink',Aprobada:'bg-emerald-50 text-emerald-900',Rechazada:'bg-red-50 text-red-900'};
export function AdminPage() {
  const {rows,setRows,loadError} = useRequestsSync();
  const [filters,setFilters] = useState<AdminFilters>(EMPTY_FILTERS);
  const [processing,setProcessing] = useState<string | null>(null);
  const busy = useRef(new Set<string>());
  const mounted = useRef(true);
  useEffect(() => {mounted.current = true;return () => {mounted.current = false;};},[]);
  const [notice,setNotice] = useState<{error:boolean;text:string} | null>(null);
  const employees = readEmployees();
  const counts = countRequests(rows);
  const filtered = filterRequests(rows,filters);
  const pending = pendingRequests(filtered);
  const resolved = resolvedRequests(filtered);
  const hasFilters = Object.values(filters).some(Boolean);
  function updateFilter(key: keyof AdminFilters,value:string) {setFilters(current => ({...current,[key]:value}));}
  async function resolve(id:string,estado:'Aprobada' | 'Rechazada') {
    if (busy.current.has(id)) {setNotice({error:true,text:'Esta solicitud ya se está procesando.'});return;}
    busy.current.add(id);setProcessing(id);setNotice(null);
    // Permite pintar el estado deshabilitado antes de la escritura síncrona.
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    try {
      const result = await resolveRequestSafely(id,estado,() => mounted.current);
      if (!mounted.current) return;
      if (result.ok) {setRows(result.rows);setNotice({error:false,text:`Solicitud ${estado === 'Aprobada' ? 'aprobada' : 'rechazada'} correctamente.`});}
      else {if(result.rows) setRows(result.rows);setNotice({error:true,text:result.error});}
    } finally {busy.current.delete(id);if (mounted.current) setProcessing(null);}
  }
  function card(request: Solicitud, pending: boolean) {
    const employee = employees.find(row => row.id === request.employeeId);
    const conflicts = pending ? findConflicts(request,rows,employees) : [];
    return <li key={request.id} className="min-w-0 border border-line bg-white p-5 sm:p-6" aria-busy={processing === request.id}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-2xl uppercase">{employee?.nombre ?? 'Empleado no disponible'}</h3><p className="mt-1 text-xs text-muted">{employee?.area ?? 'Área sin registrar'}</p></div><span className={`inline-flex items-center px-3 py-1 text-xs font-semibold ${statusClass[request.estado]}`}>{request.estado}</span></div>
      <p className="mt-5 text-sm font-semibold">{request.tipo}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-muted">{request.detalle}</p>
      <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-xs sm:grid-cols-2"><div><dt className="text-muted">Fecha de la solicitud</dt><dd className="mt-1 font-medium"><time dateTime={request.fecha}>{dateLabel(request.fecha)}</time></dd></div>{!pending && <div><dt className="text-muted">Fecha de resolución</dt><dd className="mt-1 font-medium">{request.fechaResolucion ? <time dateTime={request.fechaResolucion}>{dateLabel(request.fechaResolucion,true)}</time> : 'Sin fecha registrada'}</dd></div>}</dl>
      {conflicts.length > 0 && <div className="mt-5 space-y-3">{conflicts.map(conflict => <div key={conflict.request.id} className={`border-l-4 p-4 text-xs leading-6 ${conflict.sameArea ? 'border-red-700 bg-red-50 text-red-900' : 'border-amber bg-amber/10 text-ink'}`}><p className="font-semibold">⚠ {conflict.sameArea ? 'Misma área: revisar antes de aprobar' : 'Coincide en fecha con otra licencia de distinta área'}</p><p>Coincide con la licencia de {conflict.employee?.nombre ?? 'otro empleado'} ({conflict.employee?.area ?? 'área no disponible'}) el {dateLabel(request.fecha)}.</p></div>)}</div>}
      {pending && <div className="mt-5 grid grid-cols-2 gap-3"><button type="button" disabled={processing !== null} onClick={() => void resolve(request.id,'Aprobada')} className="min-h-12 cursor-pointer border border-emerald-800 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-900 disabled:cursor-wait disabled:opacity-40">Aprobar</button><button type="button" disabled={processing !== null} onClick={() => void resolve(request.id,'Rechazada')} className="min-h-12 cursor-pointer border border-red-800 bg-red-50 px-3 py-3 text-sm font-semibold text-red-900 disabled:cursor-wait disabled:opacity-40">Rechazar</button></div>}
    </li>;
  }
  return <section className="mx-auto min-h-[75vh] max-w-7xl px-5 py-10 sm:px-10 sm:py-14"><p className="eyebrow text-muted">PORTAL INTERNO · ADMINISTRACIÓN</p><h1 className="mt-4 font-display text-4xl uppercase sm:text-5xl">Panel de Administración</h1><p className="mt-3 text-sm leading-7 text-muted">Todas las solicitudes del equipo, para decidir con la información a mano.</p>
    {loadError ? <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-5 text-sm text-red-900">{loadError} No se pueden mostrar ni resolver solicitudes.</p> : <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">{([['Pendiente','Pendientes'],['Aprobada','Aprobadas'],['Rechazada','Rechazadas']] as const).map(([state,label]) => <div key={state} className={`border border-line p-6 ${statusClass[state]}`}><p className="font-display text-5xl">{counts[state]}</p><p className="mt-2 text-sm font-medium">{label}</p></div>)}</div><p className="mt-3 text-xs text-muted">Totales de todas las solicitudes. Los filtros se aplican a las dos listas.</p>
      <section aria-labelledby="filters-heading" className="my-8 border border-line bg-white p-5 sm:p-6"><h2 id="filters-heading" className="font-display text-2xl uppercase">Filtrar solicitudes</h2><div className="mt-5 grid items-end gap-4 md:grid-cols-4"><div><label className="form-label" htmlFor="filter-employee">Empleado</label><select id="filter-employee" className="request-field" value={filters.employeeId} onChange={event => updateFilter('employeeId',event.target.value)}><option value="">Todos</option>{employees.map(employee => <option key={employee.id} value={employee.id}>{employee.nombre}</option>)}</select></div><div><label className="form-label" htmlFor="filter-type">Tipo</label><select id="filter-type" className="request-field" value={filters.tipo} onChange={event => updateFilter('tipo',event.target.value)}><option value="">Todos</option>{REQUEST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></div><div><label className="form-label" htmlFor="filter-date">Fecha</label><input id="filter-date" className="request-field" type="date" value={filters.fecha} onChange={event => updateFilter('fecha',event.target.value)}/></div><button type="button" className="secondary-button" onClick={() => setFilters(EMPTY_FILTERS)}>Limpiar filtros</button></div><p className="mt-4 text-xs leading-6 text-muted">Fecha exacta de la solicitud, no de su resolución. Las coincidencias consideran también las licencias ocultas por los filtros.</p></section>
      {notice && <p role={notice.error ? 'alert' : 'status'} className={`mb-6 border p-4 text-sm leading-6 ${notice.error ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber/40 bg-amber/10 text-ink'}`}>{notice.text}</p>}
      <div className="grid items-start gap-8 xl:grid-cols-2"><section aria-labelledby="pending-heading" className="min-w-0"><p className="eyebrow text-muted">01 / POR REVISAR</p><h2 id="pending-heading" className="mb-5 mt-3 font-display text-3xl uppercase">Solicitudes pendientes</h2>{pending.length ? <ul className="space-y-4">{pending.map(request => card(request,true))}</ul> : <p className="border border-dashed border-line bg-white p-6 text-sm leading-7">{hasFilters ? 'No hay solicitudes pendientes que coincidan con los filtros.' : 'No hay solicitudes pendientes en este momento.'}</p>}</section><section aria-labelledby="history-heading" className="min-w-0"><p className="eyebrow text-muted">02 / REGISTRO DEL EQUIPO</p><h2 id="history-heading" className="mb-5 mt-3 font-display text-3xl uppercase">Historial de solicitudes resueltas</h2>{resolved.length ? <ul className="space-y-4">{resolved.map(request => card(request,false))}</ul> : <p className="border border-dashed border-line bg-white p-6 text-sm leading-7">{hasFilters ? 'No hay solicitudes en el historial que coincidan con los filtros.' : 'Todavía no hay solicitudes resueltas.'}</p>}</section></div>
    </>}
  </section>;
}
