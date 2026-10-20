import { lazy, Suspense, useEffect } from 'react';
import { PageShell } from './components/layout/PageShell';
import { LoginPage } from './pages/LoginPage';
import { LoadingState } from './components/LoadingState';
import { StartupUnavailable } from './components/StartupUnavailable';
import { usePathname, navigate } from './lib/navigation';
import { useSession } from './lib/useSession';
import { refreshSession } from './lib/session';
async function demoDelay() {
  // Solo desarrollo: permite inspeccionar el estado de carga sin ralentizar producción.
  const delay = import.meta.env.DEV ? Math.min(5000,Math.max(0,Number(new URLSearchParams(window.location.search).get('demoDelay')) || 0)) : 0;
  if(delay) await new Promise(resolve => setTimeout(resolve,delay));
}
const EmpresaPage = lazy(() => import('./pages/EmpresaPage').then(async module => {await demoDelay();return {default:module.EmpresaPage};}));
const AdminPage = lazy(() => import('./pages/AdminPage').then(async module => {await demoDelay();return {default:module.AdminPage};}));
const EmpleadoPage = lazy(() => import('./pages/EmpleadoPage').then(async module => {await demoDelay();return {default:module.EmpleadoPage};}));
function Redirect({to}:{to:string}) {useEffect(() => {navigate(to,true);},[to]);return <LoadingState/>;}
export function App({initialized = true}:{initialized?:boolean}) {
  useEffect(() => {window.addEventListener('pageshow',refreshSession);return () => window.removeEventListener('pageshow',refreshSession);},[]);
  const path = usePathname();
  const session = useSession();
  let content;
  if (path === '/empresa') content = <EmpresaPage/>;
  else if (!initialized) content = <StartupUnavailable/>;
  else if (path === '/login') content = session ? <Redirect to={session.rol === 'admin' ? '/admin' : '/empleado'}/> : <LoginPage/>;
  else if (path === '/empleado' || path === '/admin') {
    const required = path === '/admin' ? 'admin' : 'empleado';
    content = session?.rol === required ? (required === 'empleado' ? <EmpleadoPage key={session.employeeId} session={session}/> : <AdminPage/>) : <Redirect to="/login"/>;
  } else content = <Redirect to="/empresa"/>;
  useEffect(() => {document.title = `${path === '/login' ? 'Acceso' : path === '/admin' ? 'Administración' : path === '/empleado' ? 'Empleado' : 'La empresa'} · Aldao Metalúrgica`;},[path]);
  return <PageShell><Suspense fallback={<LoadingState/>}>{content}</Suspense></PageShell>;
}
