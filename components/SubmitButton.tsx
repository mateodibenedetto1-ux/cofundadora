'use client';
import { useFormStatus } from 'react-dom';

/** Botón de formulario que muestra un spinner sutil mientras se envía. */
export function SubmitButton({ children, pendingLabel, className = 'btn primary' }: { children: React.ReactNode; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} aria-busy={pending}>
      {pending && <span className="spin" aria-hidden="true" />}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
