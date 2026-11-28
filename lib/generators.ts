/** Generadores guiados de Visionaria: la fundadora elige el formato, llena un formulario y recibe la pieza. */

export interface GenField { k: string; label: string; kind: 'select' | 'text' | 'textarea'; options?: string[]; optional?: boolean; placeholder?: string }
export interface Generator { k: string; label: string; title: string; about: string; fields: GenField[]; guide: string }

const OBJETIVO: GenField = {
  k: 'objetivo', label: '¿Qué quieres lograr con esta pieza?', kind: 'select',
  options: ['Cautivar: atraer a personas nuevas', 'Conectar: generar confianza con quien ya me sigue', 'Convertir: llevar a la acción o a la venta'],
};
const TEMA: GenField = { k: 'tema', label: 'Tema o idea (sé lo más específica posible)', kind: 'textarea', placeholder: 'Ej.: por qué mis clientas siguen cansadas aunque comen bien' };
const PROVOCAR = (what: string): GenField => ({
  k: 'provocar', label: `¿Qué quieres provocar con ${what}?`, kind: 'select',
  options: ['Identificación: "esto me pasa a mí"', 'Curiosidad', 'Inspiración', 'Confianza en mi método', 'Deseo de trabajar conmigo', 'Urgencia de actuar'],
});

export const GENERATORS: Generator[] = [
  {
    k: 'reel', label: 'Reels / Talking Head', title: 'Guion para reel', about: 'Guion para hablar a cámara según la metodología MAGNA.',
    fields: [
      OBJETIVO, TEMA,
      { k: 'accion', label: '¿Qué quieres que haga quien vea el video?', kind: 'text', placeholder: 'Ej.: comentar la palabra MISIÓN, guardar el video, escribirme por DM' },
      { k: 'conoce', label: '¿Cuánto te conoce la persona que lo verá?', kind: 'select', options: ['No me conoce', 'Me sigue hace poco', 'Me conoce bien y confía en mí'] },
      PROVOCAR('este video'),
      { k: 'duracion', label: '¿Cuánto durará el video?', kind: 'select', options: ['15 a 30 segundos', '30 a 60 segundos', '60 a 90 segundos'] },
    ],
    guide: 'Entrega 3 variantes del guion (Variante 1, 2 y 3), cada una con su gancho de los primeros 3 segundos, el guion para decir a cámara dividido en partes con indicaciones breves entre corchetes, el CTA y un copy para la publicación. Cada guion debe poder decirse en la duración elegida. Al final, recomienda las 2 mejores y explica por qué en pocas líneas.',
  },
  {
    k: 'carrusel', label: 'Carruseles', title: 'Carrusel', about: 'Carrusel según los frameworks oficiales MAGNA.',
    fields: [
      OBJETIVO, TEMA,
      { k: 'laminas', label: '¿Cuántas láminas tendrá?', kind: 'select', options: ['5 láminas', '7 láminas', '10 láminas'] },
      PROVOCAR('este contenido'),
    ],
    guide: 'Entrega 3 variantes del carrusel (Variante 1, 2 y 3), cada una lámina por lámina (Lámina 1, Lámina 2…): la primera es el gancho, la última tiene el CTA. Frases cortas que se lean en una pantalla de celular, y un copy para la publicación. Al final, recomienda las 2 mejores y explica por qué en pocas líneas.',
  },
  {
    k: 'email', label: 'Emails & Newsletters', title: 'Email', about: 'Email según la metodología MAGNA.',
    fields: [
      OBJETIVO, TEMA,
      { k: 'accion', label: '¿Qué quieres que haga al terminar de leer?', kind: 'text', optional: true, placeholder: 'Opcional. Ej.: responder el email, agendar una llamada' },
      PROVOCAR('este contenido'),
    ],
    guide: 'Entrega 3 variantes del email (Variante 1, 2 y 3), cada una con asunto, preheader y cuerpo en párrafos cortos, en su voz, cerrando con una sola llamada a la acción. Al final, recomienda las 2 mejores y explica por qué en pocas líneas.',
  },
  {
    k: 'venta', label: 'Páginas de Venta', title: 'Página de venta', about: 'Página de venta según la guía oficial MAGNA.',
    fields: [
      { k: 'oferta', label: 'Oferta', kind: 'select', options: ['Mi Oferta Exponencial', 'Mi low ticket', 'Otra oferta'] },
      { k: 'precio', label: 'Precio y forma de pago', kind: 'text', placeholder: 'Ej.: USD 1.500 o 3 cuotas de USD 550' },
      { k: 'detalles', label: 'Detalles reales (formato, duración, bonos, garantía, testimonios)', kind: 'textarea', placeholder: 'Solo información real: no inventamos testimonios ni resultados.' },
    ],
    guide: 'Sigue la guía Página de Venta MAGNA sección por sección, con el título de cada sección. Entrega 2 variantes completas (Variante 1 y 2). Si falta un dato, deja un marcador visible como [PRECIO] o [TESTIMONIO] en lugar de inventarlo. Al final, indica qué partes de cada variante son más coherentes y efectivas para la conversión y por qué.',
  },
  {
    k: 'naming', label: 'Naming', title: 'Nombres', about: 'Nombres con la esencia de tu marca según la metodología MAGNA.',
    fields: [
      { k: 'que', label: '¿Qué quieres nombrar?', kind: 'select', options: ['Mi método', 'Mi Oferta Exponencial', 'Mi low ticket', 'Un programa', 'Mi comunidad', 'Otro'] },
      { k: 'transformacion', label: '¿Qué es y qué transformación da? (sé lo más específica posible)', kind: 'textarea' },
      { k: 'palabras', label: 'Palabras, sensaciones o ideas que quieres que transmita', kind: 'text', optional: true, placeholder: 'Opcional' },
    ],
    guide: 'Entrega de 6 a 8 nombres en 3 direcciones creativas distintas, cada uno con su concepto en una línea. Recomienda los 2 mejores, con una tagline para cada uno, y explica por qué. Revisa que ninguno choque con las palabras que evita en su voz. No afirmes que un nombre está disponible (marca, dominio o redes) sin haberlo verificado.',
  },
  {
    k: 'ideas', label: 'Ideas de contenido', title: 'Ideas de contenido', about: 'Ideas para reels, carruseles y campañas, ordenadas en Cautivar, Conectar y Convertir.',
    fields: [
      { k: 'tema', label: '¿Sobre qué quieres ideas? (tema, oferta o campaña)', kind: 'textarea', placeholder: 'Ej.: ideas para lanzar mi low ticket en enero' },
      { k: 'formato', label: '¿Para qué formato?', kind: 'select', options: ['Reels', 'Carruseles', 'Stories', 'Mezcla de formatos'] },
    ],
    guide: 'Entrega como máximo 7 ideas, clasificadas en Cautivar, Conectar o Convertir, cada una con su gancho y una línea de enfoque. Señala las 2 con mayor potencial y explica por qué.',
  },
];

export const genByKey = (k: string) => GENERATORS.find((g) => g.k === k);
