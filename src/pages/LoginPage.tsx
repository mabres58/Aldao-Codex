import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Sesion } from '../types';
import { ROLE_PASSWORDS } from '../lib/config';
import { readEmployees, startSession } from '../lib/session';
import { navigate } from '../lib/navigation';

export function LoginPage() {
  const [role, setRole] = useState<Sesion['rol'] | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [employeeError, setEmployeeError] = useState('');
  const employees = readEmployees();

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) return;
    const validEmployee = role === 'admin' || employees.some(employee => employee.id === selected);
    setEmployeeError(validEmployee ? '' : 'Seleccioná el empleado que va a ingresar.');
    if (!password) { setError('Ingresá la clave de acceso.'); return; }
    if (password !== ROLE_PASSWORDS[role]) { setError('Clave incorrecta. Probá nuevamente.'); return; }
    setError('');
    if (!validEmployee) return;
    const result = startSession({
      rol: role,
      employeeId: role === 'empleado' ? selected : null,
      timestamp: new Date().toISOString(),
    });
    if (!result.ok) {
      setError('No se pudo iniciar sesión: el almacenamiento del navegador no está disponible.');
      return;
    }
    navigate(role === 'admin' ? '/admin' : '/empleado', true);
  }

  function back() {
    setRole(null);
    setError('');
    setEmployeeError('');
    setPassword('');
    setSelected('');
  }

  return (
    <section className="mx-auto min-h-[75vh] max-w-3xl px-5 py-12 sm:py-16">
      <p className="eyebrow text-muted">PORTAL INTERNO</p>
      <h1 className="mt-4 font-display text-4xl uppercase sm:text-5xl">
        {role ? 'Ingresá a tu espacio.' : 'Nuestro equipo, conectado.'}
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        {!role ? 'Elegí cómo querés ingresar al portal de Aldao.' : role === 'empleado'
          ? 'Elegí tu nombre e ingresá la clave de acceso.'
          : 'Acceso de Administración.'}
      </p>
      <p className="mb-5 text-xs font-semibold tracking-widest text-muted">PASO {role ? 2 : 1} / 2</p>
      {!role ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {(['empleado', 'admin'] as const).map(value => (
            <button key={value} type="button" className="role-card" onClick={() => setRole(value)}>
              <span className="font-display text-3xl uppercase">{value === 'empleado' ? 'Empleado' : 'Administración'}</span>
              <span className="mt-3 block text-sm text-muted">
                {value === 'empleado' ? 'Elegí tu nombre e ingresá con la clave.' : 'Ingresá al espacio de administración.'}
              </span>
              <span className="mt-7 block text-sm font-semibold">Elegir rol →</span>
            </button>
          ))}
        </div>
      ) : (
        <form noValidate onSubmit={verify} className="space-y-6 border border-line bg-white p-6 sm:p-8">
          {role === 'empleado' && (
            <div>
              <label htmlFor="login-employee" className="form-label">Empleado <span aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span></label>
              <select
                autoFocus id="login-employee" required className="request-field"
                value={selected}
                onChange={event => { setSelected(event.target.value); setEmployeeError(''); }}
                aria-invalid={!!employeeError}
                aria-describedby={employeeError ? 'employee-error' : undefined}
              >
                <option value="" disabled>Seleccioná tu nombre</option>
                {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.nombre} — {employee.area}</option>)}
              </select>
              {employeeError && <p id="employee-error" role="alert" className="field-error">{employeeError}</p>}
              {employees.length === 0 && <p role="alert" className="field-error">No se pudieron cargar los empleados. Intentá nuevamente.</p>}
            </div>
          )}
          <div>
            <label htmlFor="password" className="form-label">Clave de acceso <span aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span></label>
            <input
              autoFocus={role === 'admin'} id="password" type="password" placeholder="Ingresá la clave"
              autoComplete="current-password" required value={password}
              onChange={event => { setPassword(event.target.value); setError(''); }}
              aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined}
              className="request-field bg-surface"
            />
            {error && <p id="login-error" role="alert" className="field-error">{error}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="button cursor-pointer" type="submit">Ingresar →</button>
            <button className="secondary-button" type="button" onClick={back}>Volver</button>
          </div>
        </form>
      )}
    </section>
  );
}
