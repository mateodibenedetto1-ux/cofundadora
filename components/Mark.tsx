/** Isotipo de Cofundadora: una estrella de cuatro puntas, en el tono de Seres Magnéticos. */
export function Cube({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" fill="var(--brand)" />
    </svg>
  );
}

export function Mark({ href = '/', label = 'Cofundadora' }: { href?: string; label?: string }) {
  return (
    <a className="mark" href={href}>
      <Cube />
      <span>{label}</span>
    </a>
  );
}
