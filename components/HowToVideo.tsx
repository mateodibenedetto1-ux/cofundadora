'use client';
import { useState } from 'react';

/** Video "Cómo usar tu Cofundadora": tarjeta que se abre y reproduce dentro del portal. */
export function HowToVideo({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="panel howto">
      <button type="button" className="howto-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="howto-play" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5L7 4.5Z" fill="currentColor" /></svg>
        </span>
        <span className="grow" style={{ textAlign: 'left' }}>
          <b>Cómo funciona tu Cofundadora</b>
          <span className="muted small" style={{ display: 'block' }}>Video de 15 minutos: tu Segundo cerebro, tu Cofundadora, Visionaria, el Roadmap y la Biblioteca.</span>
        </span>
        <span className="muted small">{open ? 'Cerrar' : 'Ver video'}</span>
      </button>
      {open && (
        <video className="howto-video" controls autoPlay playsInline preload="metadata" poster="/videos/como-usar-cofundadora.jpg">
          <source src="/videos/como-usar-cofundadora.mp4" type="video/mp4" />
        </video>
      )}
    </section>
  );
}
