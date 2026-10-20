import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Sesion, Solicitud } from '../types';
import { readEmployees } from '../lib/session';
import { ownRequests, REQUEST_TYPES, saveRequest, validateDraft } from '../lib/requests';
import { useRequestsSync } from '../lib/useRequestsSync';
import { withDataLock } from '../lib/storage';
import type { RequestDraft, RequestErrors } from '../lib/requests';

const initialDraft: RequestDraft = {tipo:'',detalle:'',fecha:''};
const copy = {
  'Licencia / día libre': {placeholder:'Ej: trámite personal en BPS, control médico, viaje familiar...',help:'Contá brevemente el motivo de la licencia o día libre.',date:'Fecha de ausencia'},
  'Equipo de seguridad': {placeholder:'Ej: guantes anticorte talla L, arnés con enganche doble, casco con protector auditivo...',help:'Especificá el equipo y el motivo (gastado, dañado, no pasó inspección, etc.).',date:'Fecha de entrega requerida'},
  'Horas extra': {placeholder:'Ej: montaje de estructura en obra, reparación urgente de compresor...',help:'Describí la tarea y el turno u horario previsto.',date:'Fecha de realización de las horas extra'},
};
const badgeColors: Record<Solicitud['estado'],string> = {
  Pendiente:'bg-amber/20 text-ink',Aprobada:'bg-emerald-50 text-emerald-900',Rechazada:'bg-red-50 text-red-900',
};
function displayDate(value: string) {
  return new Intl.DateTimeFormat('es-UY',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`));
}
export function EmpleadoPage({session}:{session:Sesion}) {
  const {rows,setRows,loadError,setLoadError} = useRequestsSync();
  const [draft,setDraft] = useState<RequestDraft>(initialDraft);
  const [errors,setErrors] = useState<RequestErrors>({});
  const [saveError,setSaveError] = useState('');
  const [success,setSuccess] = useState(false);
  const sending = useRef(false);
  const typeRef = useRef<HTMLSelectElement>(null);
  const detailRef = useRef<HTMLTextAreaElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const employee = readEmployees().find(row => row.id === session.employeeId);
  const requests = ownRequests(rows,session.employeeId!);
  const context = copy[draft.tipo as keyof typeof copy];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    setSuccess(false);setSaveError('');
    const invalid = validateDraft(draft);
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      if (invalid.tipo) typeRef.current?.focus();else if (invalid.detalle) detailRef.current?.focus();else dateRef.current?.focus();
      return;
    }
    sending.current = true;
    try {
      const result = await withDataLock(() => saveRequest(draft,session.employeeId!));
      if (!result.ok) {setSaveError(result.error);return;}
      setRows(result.value);setLoadError('');setDraft(initialDraft);setErrors({});setSuccess(true);
    } finally {sending.current = false;}
  }
  function change(field: keyof RequestDraft, value: string) {setDraft(current => ({...current,[field]:value}));setSuccess(false);}
  function focusForm() {typeRef.current?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});typeRef.current?.focus({preventScroll:true});}
  return <section className="mx-auto min-h-[75vh] max-w-7xl px-5 py-10 sm:px-10 sm:py-14">
    <p className="eyebrow text-muted">PORTAL INTERNO · EMPLEADO</p>
    <h1 className="mt-4 font-display text-4xl uppercase sm:text-5xl">Hola, {employee?.nombre}</h1>
    <p className="mt-3 text-sm text-muted">Área: <span className="font-medium text-ink">{employee?.area}</span></p>
    <div className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="form-heading" className="min-w-0 border border-line bg-white p-5 sm:p-8">
        <p className="eyebrow text-muted">01 / CONTANOS QUÉ NECESITÁS</p><h2 id="form-heading" className="mt-3 font-display text-3xl uppercase">Nueva solicitud</h2><p className="mt-3 text-xs leading-6 text-muted">Todos los campos son obligatorios (*). Administración revisará tu solicitud.</p>
        <form noValidate onSubmit={submit} className="mt-6 space-y-6">
          <div><label htmlFor="request-type" className="form-label">Tipo *</label><select ref={typeRef} id="request-type" required value={draft.tipo} onChange={event => change('tipo',event.target.value)} aria-invalid={!!errors.tipo} aria-describedby={errors.tipo ? 'type-error' : undefined} className="request-field"><option value="" disabled>Seleccioná un tipo</option>{REQUEST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select>{errors.tipo && <p className="field-error" id="type-error">{errors.tipo}</p>}</div>
          <div><label htmlFor="request-detail" className="form-label">Detalle *</label><textarea ref={detailRef} id="request-detail" required disabled={!context} rows={4} placeholder={context?.placeholder ?? 'Primero seleccioná un tipo'} value={draft.detalle} onChange={event => change('detalle',event.target.value)} aria-invalid={!!errors.detalle} aria-describedby={`detail-help${errors.detalle ? ' detail-error' : ''}`} className="request-field resize-y disabled:bg-surface disabled:text-muted"/><p id="detail-help" className="mt-2 text-xs leading-6 text-muted">{context?.help ?? 'Elegí el tipo de solicitud para completar el detalle.'}</p>{errors.detalle && <p className="field-error" id="detail-error">{errors.detalle}</p>}</div>
          <div><label htmlFor="request-date" className="form-label">{context?.date ?? 'Fecha'} *</label><input ref={dateRef} id="request-date" type="date" required value={draft.fecha} onChange={event => change('fecha',event.target.value)} aria-invalid={!!errors.fecha} aria-describedby={errors.fecha ? 'date-error' : undefined} className="request-field"/>{errors.fecha && <p className="field-error" id="date-error">{errors.fecha}</p>}</div>
          {saveError && <p role="alert" className="border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">{saveError}</p>}
          {success && <p role="status" className="border border-amber/40 bg-amber/10 p-4 text-sm leading-6">Solicitud enviada correctamente. Quedó pendiente de aprobación.</p>}
          <button type="submit" className="button w-full cursor-pointer justify-center">Enviar solicitud <span aria-hidden="true">→</span></button>
        </form>
      </section>
      <section aria-labelledby="requests-heading" className="min-w-0"><div className="mb-5 border-b border-line pb-5"><p className="eyebrow text-muted">02 / SEGUIMIENTO</p><h2 id="requests-heading" className="mt-3 font-display text-3xl uppercase">Mis solicitudes</h2><p className="mt-3 text-xs text-muted">Tus solicitudes, de la más reciente a la más antigua.</p></div>
        {loadError ? <p role="alert" className="border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">{loadError} No se puede mostrar el historial.</p> : requests.length === 0 ? <div className="border border-dashed border-line bg-white p-7"><p className="text-sm leading-7">Todavía no tenés solicitudes registradas.</p><button type="button" onClick={focusForm} className="secondary-button mt-5">Crear tu primera solicitud</button></div> : <ul className="space-y-4">{requests.map(request => <li key={request.id} className="border border-line bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-display text-xl uppercase">{request.tipo}</h3><span className={`inline-flex min-h-7 items-center px-3 py-1 text-xs font-semibold ${badgeColors[request.estado]}`}>{request.estado}</span></div><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-muted">{request.detalle}</p><p className="mt-5 border-t border-line pt-4 text-xs"><span className="text-muted">Fecha solicitada</span> <time className="ml-2 font-medium" dateTime={request.fecha}>{displayDate(request.fecha)}</time></p></li>)}</ul>}
      </section>
    </div>
  </section>;
}
