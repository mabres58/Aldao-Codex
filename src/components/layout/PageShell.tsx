import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { Header } from './Header';
import { useStorageStatus } from '../../lib/useStorageStatus';
export function PageShell({children}:{children:ReactNode}) {
  const status = useStorageStatus();
  const shell = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = shell.current;
    const header = root?.querySelector('header');
    if (!root || !header) return;
    const measure = () => {const headerHeight = header.getBoundingClientRect().height;const bannerHeight = banner.current?.getBoundingClientRect().height ?? 0;root.style.setProperty('--header-height',`${headerHeight}px`);root.style.setProperty('--banner-height',`${bannerHeight}px`);document.documentElement.style.setProperty('--fixed-offset',`${headerHeight+bannerHeight}px`);};
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);if(banner.current) observer.observe(banner.current);
    return () => observer.disconnect();
  },[status]);
  return <div ref={shell} className="safe-root"><a href="#contenido" className="skip-link">Saltar al contenido</a><Header/>{status === 'error' && <div ref={banner} role="alert" style={{top:'var(--header-height, 80px)'}} className="safe-banner fixed inset-x-0 z-10 border-b border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-950"><div className="mx-auto flex max-w-7xl gap-3"><span aria-hidden="true">⚠</span><p>El almacenamiento del navegador no está disponible. Los cambios no se están guardando. Verificá que no estés en modo privado o que no hayas superado el límite de almacenamiento.</p></div></div>}<main id="contenido" style={{paddingTop:'calc(var(--header-height, 80px) + var(--banner-height, 0px))'}}>{children}</main><footer className="bg-ink px-5 py-8 text-sm text-white/60"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row"><span className="font-display tracking-widest text-white">ALDAO METALÚRGICA</span><span>Paysandú, Uruguay <span className="mx-2 text-amber">/</span> Hecho para trabajar juntos.</span></div></footer></div>;
}
