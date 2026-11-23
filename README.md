# Cofundadora · Seres Magnéticos

El espacio de las fundadoras de MAGNA, con **Visionaria**, su cofundadora con IA.

**Panel de Val** (`/panel`): Home, Fundadoras y Contenido. Dentro de cada fundadora: Resumen, Segundo cerebro, Visionaria, Contenido, Accionables, Recursos, Biblioteca, Roadmap y Accesos.

**Portal de cada fundadora** (`/c/<fundadora>`): Inicio, Segundo cerebro, Visionaria, Contenido, Accionables, Recursos, Biblioteca y Roadmap.

- **Segundo cerebro:** el onboarding guiado por el método MAGNA (Mujer Magna → Brand Brief → Brief de comunicación → Contenido magnífico → Metodología → Oferta exponencial → Oferta low ticket → Lanzamiento → Sistemas y métricas).
- **Visionaria:** responde con el Segundo cerebro de la fundadora y el método MAGNA. Usa la API key de Anthropic de cada fundadora (se guarda cifrada), así el gasto es de cada una.
- **Roadmap:** cuando el Segundo cerebro está completo, se genera un roadmap personalizado etapa por etapa.
- **Contenido:** cada fundadora conecta su Instagram y ve qué contenido trae vistas, seguidores y conversaciones.

Basado en Fractal OS.

---

## Ver la demo

Sin variables de entorno la app corre en modo demo:

```bash
npm install
npm run dev
# http://localhost:3000/panel  y  http://localhost:3000/c/luna-estudio
```

## Ponerlo en producción

### 1. Supabase
1. Crear un proyecto en supabase.com.
2. SQL Editor → pegar `supabase/setup.sql` completo → Run.
3. Authentication → URL Configuration: **Site URL** = la URL de Vercel; en **Redirect URLs** agregar `https://TU-APP.vercel.app/**`.
4. Project Settings → API: copiar `URL`, `anon key` y `service_role key`.

### 2. Vercel
1. Add New Project → importar este repo.
2. Environment Variables (ver `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` = la URL de Vercel
   - `ANTHROPIC_API_KEY` (la del equipo: roadmaps y Visionaria en el panel)
   - `AI_KEYS_SECRET` (una frase larga al azar: cifra las keys de las fundadoras)
3. Deploy.

### 3. Cuenta de Val
1. Supabase → Authentication → Users → Add user (email y contraseña).
2. SQL Editor (con ese email):
   ```sql
   insert into memberships (user_id, org_id, role)
   select u.id, o.id, 'owner' from auth.users u, organizations o
   where u.email = 'EMAIL' and o.slug = 'seres-magneticos';
   ```
3. Entrar en `/login`. Desde Ajustes se invita al resto del equipo y desde cada fundadora → Accesos se invita a cada una.

### 4. Método MAGNA para Visionaria
Los documentos del método (frameworks, guías, metodología) se cargan en la tabla `kb_documents`: Visionaria busca ahí lo relevante para cada pregunta.
