import { useSession } from '../../lib/useSession';
import { readEmployees } from '../../lib/session';
import { usePathname } from '../../lib/navigation';
import { LogoutButton } from '../LogoutButton';
export function Header() {
  const session = useSession();
  const path = usePathname();
  const name = session?.rol === 'empleado' ? readEmployees().find(employee => employee.id === session.employeeId)?.nombre : null;
  return <header className="fixed inset-x-0 top-0 z-20 border-b border-white/10 bg-ink text-white"><div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 sm:px-10"><a href="/empresa" aria-label="Aldao Metalúrgica, inicio" className="flex min-h-11 items-center gap-2 font-display text-lg font-semibold tracking-[.14em] sm:text-2xl">ALDAO <span className="text-amber">METALÚRGICA</span></a><div className="flex flex-wrap items-center gap-3"><nav aria-label="Navegación principal" className="col-span-full flex flex-wrap items-center gap-3"><a href="/empresa" aria-current={path === '/empresa' ? 'page' : undefined} className="flex min-h-11 items-center border-b-2 border-amber text-sm">La empresa</a><a href="/login" className="button">Acceso al panel</a></nav>{session && <><p className="max-w-44 text-xs leading-5 text-white/75">{session.rol === 'admin' ? 'Administración' : 'Empleado'}{name && <span className="block text-white">{name}</span>}</p><LogoutButton/></>}</div></div></header>;
}
