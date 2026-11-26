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
  /** Lo que se lleva al terminar la fase */
  practical?: string;
  emotional?: string;
  materials?: string[];
  steps?: string[];
  /** Cuándo se da por terminada */
  done?: string;
  /** Piezas de contenido por semana en esta fase */
  content?: string;
}

export const MODULES: Module[] = [
  {
    k: 'marca', n: '1', title: 'La Marca Definida', lead: 'Val', weeks: 0,
    about: 'Defines con claridad qué viene a decir tu marca al mundo y a quién quieres servir.',
    practical: 'Sales con tu Brand Brief, tu Big Idea, tus 5 creencias y una bio que posiciona.',
    emotional: 'Dejas de sentirte dispersa y empiezas a sentir dirección, enfoque y la certeza de hacia dónde vas.',
    materials: ['Clase y hoja de trabajo de Tu Marca Memorable', 'Brand Brief Framework', 'Clase de Posicionamiento de Alto Calibre (ejercicio 1)'],
    steps: [
      'Ve la clase Tu Marca Memorable y escribe tu Big Idea en una frase',
      'Completa el Brand Brief: primero tu clienta, después tu marca',
      'Ve la clase Posicionamiento de Alto Calibre y completa el ejercicio 1: tu oportunidad de diferenciación',
      'Escribe tus 5 creencias',
      'Actualiza tu bio',
      'Publica tu primera pieza de contenido con Visionaria',
    ],
    done: 'Puedes explicar tu marca en una frase.',
    content: '3 piezas por semana',
  },
  {
    k: 'metodologia', n: '2', title: 'La Autora con Propiedad Intelectual', lead: 'Val', weeks: 0,
    about: 'Conviertes tu forma de transformar en un método propio, con nombre, y te posicionas en una categoría donde no compites por precio.',
    practical: 'Sales con tu metodología de 3 a 5 fases, tu categoría propia, tu mensaje de posicionamiento y tu historia de origen grabada.',
    emotional: 'Dejas de dudar de tu valor como experta y te reconoces como dueña de un conocimiento que vale y que puede trascenderte.',
    materials: ['Clase y hoja de trabajo de Tu Metodología', 'Hoja de trabajo de Posicionamiento de Alto Calibre (ejercicios 2 y 3)', 'Plantilla de guion de historia'],
    steps: [
      'Elige una de las 3 formas de crear tu método',
      'Define de 3 a 5 fases, con una herramienta para cada una',
      'Ponle nombre a tu método',
      'Completa los ejercicios 2 y 3 de Posicionamiento de Alto Calibre: tu categoría propia y tu mensaje de posicionamiento',
      'Graba tu historia de origen con la plantilla de guion',
    ],
    done: 'Tu método tiene nombre y lo has compartido en el Olimpo.',
    content: '3 piezas por semana',
  },
  {
    k: 'exponencial', n: '3', title: 'La Oferta que Escala', lead: 'Val', weeks: 0,
    about: 'Diseñas tu Oferta Exponencial: el corazón de tu modelo de negocio y el lugar al que llevan todos los caminos.',
    practical: 'Sales con tu oferta high ticket definida, con precio, vehículo y una matemática que sostiene tu meta, y validada en conversaciones reales.',
    emotional: 'Dejas de cobrar desde el miedo y empiezas a poner precio desde tu visión y tu estándar.',
    materials: ['Clase y hoja de trabajo de Oferta Exponencial'],
    steps: [
      'Define tu meta económica anual y mensual',
      'Completa "Mi Oferta Exponencial en una página"',
      'Elige el vehículo y el precio, y haz la matemática',
      'Ofrécela a 3 personas reales: DM, aplicación y llamada',
    ],
    done: 'La has presentado en 3 conversaciones.',
    content: 'De 4 a 5 piezas por semana',
  },
  {
    k: 'lowticket', n: '4', title: 'El Puente Magnético', lead: 'Val', weeks: 0,
    about: 'Creas tu oferta low ticket con un fragmento de tu método y la diseñas como puente hacia tu Oferta Exponencial.',
    practical: 'Sales con tu low ticket completa: fragmento, nombre, formato, precio, ruta, bonos y el plan para presentar tu Oferta Exponencial dentro de ella.',
    emotional: 'Sientes que tu modelo de negocio ya existe y tiene sentido de principio a fin; sabes exactamente a dónde llevas a tu clienta.',
    materials: ['Clase y hoja de trabajo de Oferta Low Ticket'],
    steps: [
      'Elige el fragmento de tu método que da el primer resultado',
      'Define nombre, tagline, formato y precio',
      'Diseña la ruta de A a B, con un máximo de 3 bonos',
      'Elige tu canal acompañante: un grupo de WhatsApp o Telegram',
      'Marca en tus sesiones dónde mencionas tu Oferta Exponencial y dónde haces la invitación oficial; define el incentivo y su fecha límite',
      'Escribe la secuencia de 5 mensajes de seguimiento',
    ],
    done: 'Tu low ticket está lista para venderse.',
    content: '5 piezas por semana',
  },
  {
    k: 'lanzamiento', n: '5', title: 'Lista para Lanzar', lead: 'Val', weeks: 0,
    about: 'Reúnes todo lo que construiste y te preparas para diseñar tu primer lanzamiento a tu manera, respetando tu energía, tu momento y el tiempo que deseas dedicarle.',
    practical: 'Tienes tu marca, tu método, tu Oferta Exponencial y tu low ticket listos, y claridad sobre cómo y cuándo quieres lanzar.',
    emotional: 'Dejas de preguntarte si estás lista y empiezas a decidir cómo quieres hacerlo. Lanzas desde tu propio ritmo, no desde la presión.',
    materials: ['Todo lo que creaste en las fases anteriores', 'Visionaria'],
    steps: [
      'Revisa que tienes tus 4 piezas listas: Brand Brief, método con nombre, Oferta Exponencial y low ticket',
      'Define tu energía: qué ritmo de lanzamiento puedes sostener con calma y presencia',
      'Define tu tiempo: cuántas semanas quieres dedicarle y en qué fecha quieres abrir',
      'Escribe tu intención: qué quieres vivir y cómo te quieres sentir en este lanzamiento',
      'Da el siguiente paso: crea tu estrategia de lanzamiento a tu medida',
    ],
    done: 'Tienes todo listo y has decidido cuándo y cómo quieres lanzar.',
    content: '5 piezas por semana',
  },
];

/** Lo que se hace durante todo el método, en todas las fases. */
export const ALWAYS = {
  content: 'Desde la fase 1, publica cada semana 1 pieza para Cautivar, 1 para Conectar y 1 para Convertir, y ve aumentando la cantidad de forma progresiva. Visionaria tiene los frameworks de Contenido Magnífico.',
  identity: 'Al cerrar cada fase, escribe un decreto y compártelo en el Olimpo de MAGNA. Toma las sesiones de Mujer Magna e integra sus prácticas y perspectivas a tu vida.',
};

export const BRAIN: BrainSection[] = [
  {
    k: 'partida', n: 1, title: 'Punto de partida', mod: 'marca',
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
    k: 'identidad', n: 2, title: 'Identidad de fundadora', mod: 'marca',
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
    k: 'clienta', n: 3, title: 'Tu clienta ideal', mod: 'marca',
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
    k: 'marca', n: 4, title: 'Esencia de marca', mod: 'marca',
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
    k: 'mensaje', n: 5, title: 'Mensaje y narrativa', mod: 'marca',
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
    k: 'voz', n: 6, title: 'Tu voz', mod: 'marca',
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
    k: 'contenido', n: 7, title: 'Contenido magnífico', mod: 'marca',
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
    k: 'ia', n: 12, title: 'Reglas para tu Cofundadora', mod: 'marca',
    intro: 'La guía que tu Cofundadora y Visionaria van a respetar en cada respuesta, guion o documento que creen para ti.',
    fields: [
      { k: 'nunca', label: 'Lo que nunca debería hacer' },
      { k: 'siempre', label: 'Lo que siempre debería tener en cuenta' },
      { k: 'formato', label: 'Formato preferido', help: 'Listas, prosa, tablas.' },
      { k: 'idioma', label: 'Idioma y variante', help: 'Ej: español neutro, mexicano, de España.', short: true },
      { k: 'notas', label: 'Notas adicionales' },
    ],
  },
  {
    k: 'metricas', n: 13, title: 'Sistemas y métricas', mod: 'lanzamiento',
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

/** Un documento por sección completada del Segundo cerebro (para el estante Fundamentos de la Biblioteca). */
export function brainSectionDocs(data: BrainData): { title: string; body_md: string }[] {
  const out: { title: string; body_md: string }[] = [];
  for (const sec of BRAIN) {
    const parts: string[] = [];
    for (const f of sec.fields) {
      const v = data[`${sec.k}.${f.k}`]?.trim();
      if (!v) continue;
      // Varias líneas se muestran como lista para que no se peguen
      const lines = v.split(/\n+/).map((l) => l.trim()).filter(Boolean);
      const body = lines.length > 1 ? lines.map((l) => `- ${l.replace(/^[-•]\s*/, '')}`).join('\n') : lines[0];
      parts.push(`### ${f.label}`, '', body, '');
    }
    if (parts.length) out.push({ title: `${String(sec.n).padStart(2, '0')} · ${sec.title}`, body_md: parts.join('\n') });
  }
  return out;
}
