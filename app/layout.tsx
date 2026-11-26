import type { Metadata } from 'next';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Cofundadora', template: '%s · Cofundadora' },
  description: 'Cofundadora de Seres Magnéticos: el espacio de las fundadoras de MAGNA, con su Cofundadora y Visionaria.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Aplica el tema elegido antes de pintar, para que no parpadee */}
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('sm-theme');document.documentElement.dataset.theme=(t==='dark'?'dark':'light')}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
