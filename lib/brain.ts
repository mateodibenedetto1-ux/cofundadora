/**
 * Segundo cerebro de una fundadora de MAGNA (Seres Magnéticos).
 * Sigue el método MAGNA: Mujer Magna → Brand Brief → Brief de comunicación → Contenido magnífico →
 * Metodología → Oferta exponencial → Oferta low ticket → Lanzamiento → Sistemas y métricas.
 * Cada sección pertenece a una etapa del Recorrido MAGNA.
 */

export interface BrainField {
  k: string;
  label: string;
  help?: string;
  short?: boolean; // una línea
}

export interface BrainSection {
  k: string;
  n: number;
  title: string;
  intro: string;
  mod: string; // etapa del recorrido a la que pertenece
  fields: BrainField[];
}

/** Etapas del Recorrido MAGNA. */
export interface Module {
  k: string;
  n: string;
  title: string;
  about: string;
  lead: string;
  weeks: number;
}

export const MODULES: Module[] = [
  { k: 'mujer', n: '01', title: 'Mujer Magna', about: 'Tu identidad de fundadora, tu visión y tu punto de partida.', lead: 'Val', weeks: 2 },
  { k: 'brand', n: '02', title: 'Brand Brief', about: 'Tu clienta ideal y la esencia de tu marca.', lead: 'Val', weeks: 2 },
  { k: 'comunicacion', n: '03', title: 'Brief de comunicación', about: 'Tu mensaje, tu narrativa y tu voz.', lead: 'Val', weeks: 1 },
  { k: 'contenido', n: '04', title: 'Contenido magnífico', about: 'Contenido de posicionamiento con los frameworks de contenido magnífico.', lead: 'Val', weeks: 2 },
  { k: 'metodologia', n: '05', title: 'Metodología', about: 'Tu método propio, paso a paso.', lead: 'Val', weeks: 2 },
  { k: 'exponencial', n: '06', title: 'Oferta exponencial', about: 'La oferta que crece sin multiplicar tus horas.', lead: 'Val', weeks: 2 },
  { k: 'lowticket', n: '07', title: 'Oferta low ticket', about: 'La puerta de entrada a tu mundo.', lead: 'Val', weeks: 2 },
  { k: 'lanzamiento', n: '08', title: 'Lanzamiento', about: 'Lanzar, medir y volver a lanzar.', lead: 'Val', weeks: 2 },
  { k: 'sistemas', n: '09', title: 'Sistemas y métricas', about: 'Tu operación, tus números y tus próximos pasos.', lead: 'Val', weeks: 1 },
];

export const BRAIN: BrainSection[] = [
  {
    k: 'partida', n: 1, title: 'Punto de partida', mod: 'mujer',
    intro: 'Dónde está tu negocio hoy. Sé breve y honesta: no hay respuestas correctas.',
    fields: [
      { k: 'nombre', label: 'Nombre completo', short: true },
      { k: 'contacto', label: 'WhatsApp y email', short: true },
      { k: 'expertise', label: 'Tu expertise o profesión', help: 'A qué te dedicas y qué transformación generas.', short: true },
      { k: 'links', label: 'Links relevantes', help: 'Instagram, web, YouTube, podcast: lo que uses activamente.' },
      { k: 'facturacion', label: '¿Cuánto facturas al mes?', help: 'Un número concreto. Ej: "USD 4.000/mes en promedio en los últimos 3 meses".', short: true },
      { k: 'ofertas_hoy', label: '¿Qué vendes hoy?', help: 'Cada oferta con su precio y formato (1 a 1, grupal, curso).' },
      { k: 'equipo', label: '¿Tienes equipo o trabajas sola?', help: 'Si tienes equipo, un rol por línea.' },
      { k: 'tiempo', label: '¿Cuánto tiempo por semana le puedes dedicar a construir tu empresa?', short: true },
      { k: 'intentos', label: '¿Qué intentaste antes para crecer y qué no funcionó?' },
      { k: 'por_que_ahora', label: '¿Por qué ahora?', help: 'El momento real que te hizo dar el paso.' },
    ],
  },
  {
    k: 'identidad', n: 2, title: 'Identidad de fundadora', mod: 'mujer',
    intro: 'La mujer que está construyendo esta empresa. Primero la identidad; después las decisiones.',
    fields: [
      { k: 'vision', label: 'Tu visión a 3 años', help: 'Cómo se ve tu empresa, tu vida y tu día a día si todo sale bien.' },
      { k: 'mision', label: 'Tu misión', help: 'Qué haces todos los días y para quién.' },
      { k: 'vida_magna', label: 'Tu Vida Magna', help: 'Tiempo, presencia, libertad, familia: para qué quieres todo esto.' },
      { k: 'creencias_limite', label: 'Lo que hoy te frena por dentro', help: 'Miedos, culpas o creencias que sientes que te detienen.' },
      { k: 'decisiones', label: 'Decisiones de alto calibre que tienes pendientes' },
      { k: 'exito_90', label: 'Si en 90 días esto sale perfecto, ¿qué cambia?', help: '2 o 3 cosas concretas de tu día a día y de tus números.' },
    ],
  },
  {
    k: 'clienta', n: 3, title: 'Tu clienta ideal', mod: 'brand',
    intro: 'Cuanto más nítida sea tu clienta, mejor se diseñan tu oferta, tu contenido y tu venta.',
    fields: [
      { k: 'perfil', label: 'Perfil', help: 'Profesión, país, edad, ingresos y momento de vida.' },
      { k: 'nombre_avatar', label: 'Ponle un nombre', help: 'Ej: "Claudia".', short: true },
      { k: 'dia', label: 'Cómo es un día de su vida' },
      { k: 'problemas', label: 'Sus problemas más caros', help: 'Los 3 a 5 que más le cuestan dinero, tiempo o energía.' },
      { k: 'deseo', label: 'Lo que desea de verdad', help: 'Más allá de lo que pide.' },
      { k: 'miedos', label: 'Sus miedos' },
      { k: 'frases', label: 'Frases textuales de ella', help: 'Lo que te dice en DMs, llamadas o comentarios, tal cual.' },
      { k: 'probo', label: 'Lo que ya probó y no le funcionó' },
      { k: 'objeciones', label: 'Sus objeciones para comprar' },
      { k: 'no_es', label: 'Quién NO es tu clienta' },
    ],
  },
  {
    k: 'marca', n: 4, title: 'Esencia de marca', mod: 'brand',
    intro: 'El porqué de tu marca y el lugar que quieres ocupar en la mente de tu clienta.',
    fields: [
      { k: 'nombre_marca', label: 'Nombre de tu marca', short: true },
      { k: 'descripcion', label: 'Qué hace tu marca, para quién y cómo', help: 'En dos o tres frases.' },
      { k: 'transformacion', label: 'La transformación que generas', help: 'De dónde a dónde llevas a tu clienta.' },
      { k: 'valores', label: 'Valores no negociables' },
      { k: 'percepcion', label: '¿Cómo quieres que te perciban?' },
      { k: 'diferencia', label: '¿Qué hace única a tu marca?', help: 'Lo que nadie más en tu nicho puede decir.' },
      { k: 'estetica', label: 'Estética', help: 'Colores, tipografías, sensaciones, referentes visuales.' },
    ],
  },
  {
    k: 'mensaje', n: 5, title: 'Mensaje y narrativa', mod: 'comunicacion',
    intro: 'Tu historia, tus creencias y lo que defiendes. Es lo que hace que te elijan a ti.',
    fields: [
      { k: 'historia', label: 'Tu historia de origen' },
      { k: 'quiebre', label: 'Tu momento de quiebre', help: 'El punto en el que cambió todo.' },
      { k: 'creencias', label: 'Las creencias de tu marca', help: 'Lo que crees y quieres que tu clienta crea.' },
      { k: 'enemigo', label: 'Enemigo común', help: 'La idea o práctica de tu industria contra la que vas.' },
      { k: 'promesa', label: 'Tu promesa en una frase', short: true },
      { k: 'movimiento', label: 'El movimiento que lideras', help: 'A qué se suma tu clienta cuando te elige.' },
    ],
  },
  {
    k: 'voz', n: 6, title: 'Tu voz', mod: 'comunicacion',
    intro: 'Cómo hablas y cómo escribes, para que todo lo que crees suene a ti.',
    fields: [
      { k: 'tono', label: 'Tu tono', help: 'Adjetivos y ejemplos de cómo hablas.' },
      { k: 'palabras_si', label: 'Palabras y expresiones que siempre usas' },
      { k: 'palabras_no', label: 'Palabras que nunca usarías', help: 'Incluidas las que suenan a coach genérica o a IA.' },
      { k: 'estilo', label: 'Tu estilo escrito', help: 'Emojis, mayúsculas, signos, cómo cierras tus textos.' },
      { k: 'ejemplos', label: 'Textos tuyos que sientes muy tuyos', help: 'Pega 2 o 3 captions, emails o mensajes.' },
    ],
  },
  {
    k: 'contenido', n: 7, title: 'Contenido magnífico', mod: 'contenido',
    intro: 'Tu contenido de posicionamiento: cautivar, conectar y convertir con los frameworks de contenido magnífico.',
    fields: [
      { k: 'pilares', label: 'Tus pilares de contenido', help: 'Los 3 a 5 temas sobre los que vas a hablar siempre.' },
      { k: 'formatos', label: 'Formatos que más usas', help: 'Reels, carruseles, historias, newsletter, YouTube.' },
      { k: 'ganadoras', label: 'Las piezas que mejor te funcionaron', help: 'Con links y números si los tienes.' },
      { k: 'frecuencia', label: 'Frecuencia y plataformas', help: 'Dónde publicas hoy y cada cuánto.' },
      { k: 'produccion', label: 'Cómo produces', help: 'Quién graba, edita y diseña, y cuánto tiempo tienes.' },
      { k: 'cta', label: 'Tus llamados a la acción', help: 'Palabras clave, links, DMs: cómo invitas a dar el siguiente paso.' },
    ],
  },
  {
    k: 'metodo', n: 8, title: 'Tu metodología', mod: 'metodologia',
    intro: 'Tu método propio: lo que haces con tus clientas, convertido en pasos que se pueden enseñar.',
    fields: [
      { k: 'nombre_metodo', label: 'Nombre de tu método', short: true },
      { k: 'pasos', label: 'Los pasos de tu método', help: 'En orden, con lo que logra tu clienta en cada uno.' },
      { k: 'por_que', label: 'Por qué funciona', help: 'Lo que lo hace distinto a lo que ya existe.' },
      { k: 'resultados', label: 'Resultados de tus clientas', help: 'Antes y después, con números cuando los haya.' },
      { k: 'testimonios', label: 'Testimonios textuales' },
    ],
  },
  {
    k: 'exponencial', n: 9, title: 'Oferta exponencial', mod: 'exponencial',
    intro: 'Tu oferta premium: la que crece sin que tengas que multiplicar tus horas.',
    fields: [
      { k: 'nombre', label: 'Nombre de la oferta', short: true },
      { k: 'promesa', label: 'Promesa', help: 'El resultado concreto que logra tu clienta.' },
      { k: 'para_quien', label: 'Para quién es y para quién no' },
      { k: 'incluye', label: 'Qué incluye', help: 'Formato, duración, sesiones, materiales, acompañamiento.' },
      { k: 'precio', label: 'Precio y formas de pago', short: true },
      { k: 'one_to_many', label: '¿Qué parte puede funcionar sin tu presencia?', help: 'Grabado, grupal, comunidad, IA, equipo.' },
      { k: 'venta', label: 'Cómo la vendes', help: 'De la primera conversación al pago.' },
    ],
  },
  {
    k: 'lowticket', n: 10, title: 'Oferta low ticket', mod: 'lowticket',
    intro: 'La puerta de entrada: una oferta accesible que da un primer resultado y lleva a tu oferta exponencial.',
    fields: [
      { k: 'nombre', label: 'Nombre de la oferta', short: true },
      { k: 'resultado', label: 'Primer resultado que logra', help: 'Rápido, concreto y deseado.' },
      { k: 'formato', label: 'Formato', help: 'Taller en vivo, reto, mini curso, plantilla.' },
      { k: 'precio', label: 'Precio', short: true },
      { k: 'puente', label: 'Cómo lleva a tu oferta exponencial' },
    ],
  },
  {
    k: 'lanzamiento', n: 11, title: 'Lanzamiento', mod: 'lanzamiento',
    intro: 'El plan para lanzar, medir y volver a lanzar con lo aprendido.',
    fields: [
      { k: 'fecha', label: 'Fecha del próximo lanzamiento', short: true },
      { k: 'objetivo', label: 'Objetivo del lanzamiento', help: 'Ventas, leads o ingresos que quieres lograr.' },
      { k: 'audiencia', label: 'Tu audiencia hoy', help: 'Seguidoras, lista de emails, WhatsApp, comunidad.' },
      { k: 'plan', label: 'Plan de calentamiento y venta', help: 'Contenido, lives, emails, mensajes: qué y cuándo.' },
      { k: 'aprendizajes', label: 'Aprendizajes de lanzamientos anteriores' },
    ],
  },
  {
    k: 'ia', n: 12, title: 'Reglas para Visionaria', mod: 'sistemas',
    intro: 'La guía que Visionaria va a respetar en cada respuesta, guion o documento que cree para ti.',
    fields: [
      { k: 'nunca', label: 'Lo que nunca debería hacer' },
      { k: 'siempre', label: 'Lo que siempre debería tener en cuenta' },
      { k: 'formato', label: 'Formato preferido', help: 'Listas, prosa, tablas.' },
      { k: 'idioma', label: 'Idioma y variante', help: 'Ej: español neutro, mexicano, de España.', short: true },
      { k: 'notas', label: 'Notas adicionales' },
    ],
  },
  {
    k: 'metricas', n: 13, title: 'Sistemas y métricas', mod: 'sistemas',
    intro: 'Tu operación y tus números: hacia dónde va tu empresa y cómo medimos que avanza.',
    fields: [
      { k: 'kpis', label: 'Los números que miras hoy', help: 'Alcance, leads, conversaciones, ventas, facturación.' },
      { k: 'obj_90', label: 'Objetivo de facturación a 90 días', short: true },
      { k: 'obj_anio', label: 'Objetivo al cierre del año', short: true },
      { k: 'herramientas', label: 'Herramientas y sistemas que usas', help: 'Plataforma de cursos, email, CRM, ManyChat, IA.' },
      { k: 'depende_de_ti', label: 'Lo que hoy depende solo de ti', help: 'Lo primero a sistematizar o delegar.' },
      { k: 'trabas', label: 'Lo que hoy te impide llegar a tus números' },
    ],
  },
];

/** Avance de un módulo: el promedio de sus secciones. */
export function modulePct(data: Record<string, string>, m: Module) {
  const secs = BRAIN.filter((s) => s.mod === m.k);
  return secs.length ? Math.round(secs.reduce((a, s) => a + sectionPct(data, s), 0) / secs.length) : 0;
}

export type BrainData = Record<string, string>;
const filled = (v?: string) => !!v && v.trim().length >= 2;

export function sectionPct(data: BrainData, s: BrainSection) {
  const n = s.fields.filter((f) => filled(data[`${s.k}.${f.k}`])).length;
  return Math.round((n / s.fields.length) * 100);
}

export function brainPct(data: BrainData) {
  const all = BRAIN.flatMap((s) => s.fields.map((f) => `${s.k}.${f.k}`));
  return Math.round((all.filter((k) => filled(data[k])).length / all.length) * 100);
}

/** Exporta el segundo cerebro como Markdown (para descargar o dárselo a la IA). */
export function brainMarkdown(data: BrainData, name: string) {
  const out = [`# Segundo cerebro · ${name}`, ''];
  for (const s of BRAIN) {
    out.push(`## ${s.n}. ${s.title}`, '');
    for (const f of s.fields) {
      const v = data[`${s.k}.${f.k}`]?.trim();
      if (v) out.push(`**${f.label}**`, v, '');
    }
  }
  return out.join('\n');
}
