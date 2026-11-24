'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * En pantallas chicas: barra superior mínima (estrella + menú) y el contenido
 * como panel lateral que se desliza. En escritorio no cambia nada.
 */
export function MobileMenu({ mark, children, side = 'side' }: { mark: React.ReactNode; children: React.ReactNode; side?: 'side' | 'portal' }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return (
    <>
      <div className={`mtop mtop-${side}`}>
        {mark}
        <button className="burger" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open}>
          <span /><span />
        </button>
      </div>
      <div className={`drawer-scrim ${open ? 'on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`drawer drawer-${side} ${open ? 'on' : ''}`} aria-hidden={!open}>
        <button className="burger close" onClick={() => setOpen(false)} aria-label="Cerrar menú"><span /><span /></button>
        {children}
      </aside>
    </>
  );
}
