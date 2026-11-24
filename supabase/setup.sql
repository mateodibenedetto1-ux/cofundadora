-- ============================================================
-- COFUNDADORA · instalación completa en un solo paso
-- Supabase → SQL Editor → pegar este archivo entero → Run.
-- Es idempotente: se puede volver a correr sin romper nada.
-- ============================================================

-- ============================================================
-- COFUNDADORA (Seres Magnéticos) — esquema de base de datos (Supabase / Postgres)
-- Pegá este archivo completo en Supabase → SQL Editor → Run.
-- Es idempotente: se puede volver a correr sin romper nada.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Cuentas ----------
-- Una "organización" es una cuenta. Fractal es la cuenta principal (kind = 'agency')
-- y cada cliente es una subcuenta (kind = 'client') con parent_id = Fractal.
create table if not exists organizations (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references organizations(id) on delete cascade,
  kind          text not null default 'client' check (kind in ('agency','client')),
  name          text not null,
  slug          text not null unique,
  status        text not null default 'activo' check (status in ('onboarding','activo','pausado','finalizado')),
  offer         text,                       -- Consultoría, B2B, Contenido…
  program_month int,                        -- Mes 1..6
  start_date    date,
  next_step     text,
  contact_name  text,
  contact_email text,
  email_domains text[] not null default '{}', -- dominios/emails para asignar llamadas de Fathom automáticamente
  drive_url     text,
  tracker_url   text,
  program_url   text,
  notion_url    text,
  accent        text,                       -- color opcional del portal
  created_at    timestamptz not null default now()
);

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  user_id    uuid not null references auth.users(id) on delete cascade,
  org_id     uuid not null references organizations(id) on delete cascade,
  role       text not null default 'client' check (role in ('owner','admin','member','client')),
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

-- ---------- Llamadas ----------
create table if not exists calls (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid references organizations(id) on delete cascade, -- null = sin asignar (bandeja)
  title          text not null,
  held_at        timestamptz not null default now(),
  source         text not null default 'manual' check (source in ('fathom','manual','notion')),
  recording_id   bigint unique,
  fathom_url     text,
  share_url      text,
  summary_md     text,
  transcript     jsonb,
  raw            jsonb,
  invitee_emails text[] not null default '{}',
  status         text not null default 'pendiente' check (status in ('pendiente','procesada','error')),
  error          text,
  notion_id      text unique,
  created_at     timestamptz not null default now()
);

-- ---------- Accionables ----------
create table if not exists action_items (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  call_id       uuid references calls(id) on delete set null,
  parent_id     uuid references action_items(id) on delete cascade,
  title         text not null,
  why           text,             -- el "por qué" del accionable
  area          text,             -- Marketing, Contenido, Comercial, Operaciones…
  priority      text check (priority in ('critica','alta','media','baja')),
  owner         text not null default 'cliente' check (owner in ('cliente','fractal')),
  due_date      date,
  done          boolean not null default false,
  done_at       timestamptz,
  position      int not null default 0,
  source        text not null default 'manual' check (source in ('fathom','manual','notion','ia')),
  notion_id     text unique,
  created_at    timestamptz not null default now()
);

-- ---------- Recursos (links compartidos: docs, sheets, carpetas, videos) ----------
create table if not exists resources (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  call_id     uuid references calls(id) on delete set null,
  title       text not null,
  url         text not null,
  kind        text not null default 'link' check (kind in ('doc','sheet','slides','folder','video','page','link')),
  description text,
  created_at  timestamptz not null default now(),
  unique (org_id, url)
);

-- ---------- Biblioteca (documentos escritos dentro del sistema) ----------
create table if not exists documents (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  call_id    uuid references calls(id) on delete set null,
  title      text not null,
  kind       text not null default 'nota',
  body_md    text not null default '',
  visible_to_client boolean not null default true,
  notion_id  text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Roadmap (hitos) ----------
-- Tipos de documento (como constraint aparte para poder ampliarlos sin recrear la tabla)
alter table documents drop constraint if exists documents_kind_check;
alter table documents add constraint documents_kind_check
  check (kind in ('resumen','reporte','objetivos','sop','estrategia','diagnostico','nota'));

create table if not exists milestones (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  title      text not null,
  detail     text,
  due_date   date,
  status     text not null default 'pendiente' check (status in ('pendiente','en_curso','listo')),
  position   int not null default 0,
  notion_id  text unique,
  created_at timestamptz not null default now()
);

-- ---------- Integraciones: un webhook de Fathom por persona del equipo ----------
create table if not exists fathom_connections (
  id             uuid primary key default gen_random_uuid(),
  label          text not null,
  webhook_secret text,                 -- whsec_… que da Fathom al crear el webhook
  last_event_at  timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists action_items_org_idx on action_items(org_id, done);
create index if not exists calls_org_idx on calls(org_id, held_at desc);
create index if not exists resources_org_idx on resources(org_id);
create index if not exists documents_org_idx on documents(org_id);

-- ============================================================
-- Permisos (Row Level Security)
-- Staff de Fractal (miembros de la cuenta 'agency') ve y edita todo.
-- Un cliente solo ve su propia subcuenta y solo puede marcar accionables.
-- ============================================================

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m join organizations o on o.id = m.org_id
    where m.user_id = auth.uid() and o.kind = 'agency' and m.role in ('owner','admin','member')
  );
$$;

create or replace function can_see_org(target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_staff() or exists (
    select 1 from memberships m where m.user_id = auth.uid() and m.org_id = target
  );
$$;

alter table organizations      enable row level security;
alter table profiles           enable row level security;
alter table memberships        enable row level security;
alter table calls              enable row level security;
alter table action_items       enable row level security;
alter table resources          enable row level security;
alter table documents          enable row level security;
alter table milestones         enable row level security;
alter table fathom_connections enable row level security;

do $$ declare t text; begin
  foreach t in array array['organizations','profiles','memberships','calls','action_items','resources','documents','milestones','fathom_connections'] loop
    execute format('drop policy if exists staff_all on %I', t);
    execute format('create policy staff_all on %I for all using (is_staff()) with check (is_staff())', t);
  end loop;
end $$;

drop policy if exists client_read on organizations;
create policy client_read on organizations for select using (can_see_org(id));

drop policy if exists self_read on profiles;
create policy self_read on profiles for select using (id = auth.uid());
drop policy if exists self_update on profiles;
create policy self_update on profiles for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists self_read on memberships;
create policy self_read on memberships for select using (user_id = auth.uid());

drop policy if exists client_read on calls;
create policy client_read on calls for select using (org_id is not null and can_see_org(org_id));

drop policy if exists client_read on action_items;
create policy client_read on action_items for select using (can_see_org(org_id));
drop policy if exists client_check on action_items;
create policy client_check on action_items for update using (can_see_org(org_id)) with check (can_see_org(org_id));

drop policy if exists client_read on resources;
create policy client_read on resources for select using (can_see_org(org_id));

drop policy if exists client_read on documents;
create policy client_read on documents for select using (can_see_org(org_id) and (visible_to_client or is_staff()));

drop policy if exists client_read on milestones;
create policy client_read on milestones for select using (can_see_org(org_id));

-- El cliente solo puede tocar "done" en sus accionables; el resto de columnas queda bloqueado.
create or replace function guard_client_action_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_staff() then
    if (new.title, new.org_id, new.call_id, new.parent_id, new.area, new.priority, new.owner, new.due_date, new.position, new.why)
       is distinct from
       (old.title, old.org_id, old.call_id, old.parent_id, old.area, old.priority, old.owner, old.due_date, old.position, old.why) then
      raise exception 'Solo podés marcar accionables como completados';
    end if;
  end if;
  new.done_at := case when new.done and not old.done then now() when not new.done then null else old.done_at end;
  return new;
end $$;

drop trigger if exists action_items_guard on action_items;
create trigger action_items_guard before update on action_items
  for each row execute function guard_client_action_update();

-- Perfil automático al crear un usuario
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(
    new.raw_user_meta_data->>'full_name',
    initcap(regexp_replace(split_part(split_part(new.email, '@', 1), '.', 1), '[0-9_-]+', '', 'g'))
  ))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Cuenta principal: Seres Magnéticos
-- ============================================================
insert into organizations (kind, name, slug)
values ('agency', 'Seres Magnéticos', 'seres-magneticos')
on conflict (slug) do nothing;

-- Después de crear tu usuario (registrándote en /login), corré esto
-- reemplazando el email para hacerte dueña o dueño de la cuenta:
--
-- insert into memberships (user_id, org_id, role)
-- select u.id, o.id, 'owner' from auth.users u, organizations o
-- where u.email = 'TU_EMAIL@gmail.com' and o.slug = 'seres-magneticos'
-- on conflict do nothing;
-- Fractal OS · 002 — roadmap por tiempo, conexión con Notion y Laboratorio
-- Idempotente: se puede volver a correr.

-- Bases de Notion de cada cliente
alter table organizations add column if not exists notion_tasks_db text;
alter table organizations add column if not exists notion_roadmap_db text;
alter table organizations add column if not exists notion_calendars jsonb not null default '[]'; -- [{ "id": "...", "label": "Andy" }]
alter table organizations add column if not exists last_synced_at timestamptz;

-- Roadmap: fases (con rango) e hitos (fecha puntual). El estado se calcula por fecha salvo que se fije a mano.
alter table milestones add column if not exists kind text not null default 'hito';
alter table milestones drop constraint if exists milestones_kind_check;
alter table milestones add constraint milestones_kind_check check (kind in ('fase','hito'));
alter table milestones add column if not exists auto_status boolean not null default true;

-- Laboratorio: copia en la app del Atlas de Notion (Notion queda como respaldo y editor alternativo)
create table if not exists lab_entries (
  id          uuid primary key default gen_random_uuid(),
  notion_id   text unique,
  title       text not null,
  tipo        text,      -- Feedback, Falla, Aprendizaje, Hipótesis, Experimento, Decisión, SOP
  area        text,      -- Servicio, Creatividad, Operaciones, Oferta, Comercial, Producto, Finanzas
  estado      text not null default 'Capturado',
  prioridad   text,
  cliente     text,
  responsable text,
  fecha       date,
  fuente      text,
  notas       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table lab_entries enable row level security;
drop policy if exists staff_all on lab_entries;
create policy staff_all on lab_entries for all using (is_staff()) with check (is_staff());
create index if not exists lab_entries_fecha_idx on lab_entries(fecha desc);

-- Fichas del Laboratorio (casos por cliente y criterios). Solo equipo.
create table if not exists lab_pages (
  id         uuid primary key default gen_random_uuid(),
  notion_id  text unique not null,
  section    text not null check (section in ('cliente','criterio')),
  client     text,
  title      text not null,
  happened   text,
  learning   text,
  rule       text,
  summary    text,
  position   int not null default 0
);
alter table lab_pages enable row level security;
drop policy if exists staff_all on lab_pages;
create policy staff_all on lab_pages for all using (is_staff()) with check (is_staff());
-- 003 · Responsable por accionable y cola de cambios pendientes de subir a Notion

alter table organizations add column if not exists responsables jsonb not null default '[]'::jsonb;
-- Cada elemento: { "name": "Marcela", "side": "cliente" | "fractal", "notion_user": "<uuid de usuario de Notion, opcional>" }

alter table action_items add column if not exists responsable text;
alter table action_items add column if not exists notion_dirty boolean not null default false;

create index if not exists action_items_dirty_idx on action_items (org_id) where notion_dirty;

-- El cliente solo puede marcar como hecho; el responsable también queda protegido
create or replace function guard_client_action_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_staff() then
    if (new.title, new.org_id, new.call_id, new.parent_id, new.area, new.priority, new.owner, new.due_date, new.position, new.why, new.responsable)
       is distinct from
       (old.title, old.org_id, old.call_id, old.parent_id, old.area, old.priority, old.owner, old.due_date, old.position, old.why, old.responsable) then
      raise exception 'Solo podés marcar accionables como completados';
    end if;
  end if;
  new.done_at := case when new.done and not old.done then now() when not new.done then null else old.done_at end;
  return new;
end $$;
-- 004 · Tracker interno de Fractal: tareas del equipo en la cuenta principal, con cliente opcional

alter table organizations add column if not exists notion_client_page text;
alter table action_items add column if not exists client_org_id uuid references organizations(id) on delete set null;
-- 005 · Clientes de Consulting y su Segundo cerebro

alter table organizations add column if not exists segment text not null default 'b2b';
alter table organizations drop constraint if exists organizations_segment_check;
alter table organizations add constraint organizations_segment_check check (segment in ('b2b', 'consulting'));

-- Respuestas del Segundo cerebro: un JSON por cliente con claves "seccion.campo"
create table if not exists client_brain (
  org_id     uuid primary key references organizations(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table client_brain enable row level security;
drop policy if exists brain_rw on client_brain;
create policy brain_rw on client_brain for all using (can_see_org(org_id)) with check (can_see_org(org_id));

-- Etapas del recorrido: a qué sección del Segundo cerebro corresponde cada fase y cada tarea
alter table milestones add column if not exists brain_section text;
alter table action_items add column if not exists brain_section text;
-- Las tareas del recorrido tienen su propio origen
alter table action_items drop constraint if exists action_items_source_check;
alter table action_items add constraint action_items_source_check check (source in ('fathom','manual','notion','ia','recorrido'));
-- 006 · Base de Conocimiento de Fractal (bóveda de documentos para la IA). Solo equipo.

create table if not exists kb_documents (
  id          uuid primary key default gen_random_uuid(),
  source_id   text unique,                -- id del archivo en Google Drive
  title       text not null,
  category    text,                       -- Ops, Setting, Closing, Ofertas…
  module      text,                       -- módulo del curso (icp, oferta, brand, …)
  source_url  text,
  kind        text,                       -- doc, sheet, pdf, docx
  content     text,
  chars       int generated always as (coalesce(length(content), 0)) stored,
  summary     text,
  status      text not null default 'ok', -- ok, sin_acceso, sin_texto
  note        text,
  updated_at  timestamptz not null default now()
);
alter table kb_documents enable row level security;
drop policy if exists staff_all on kb_documents;
create policy staff_all on kb_documents for all using (is_staff()) with check (is_staff());

-- Tokens para cargar documentos desde el navegador (se guarda solo el hash)
create table if not exists ingest_tokens (
  token_hash text primary key,
  label      text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table ingest_tokens enable row level security;

-- 007: API key de Anthropic propia de cada cliente de consultoría (cifrada; solo la lee el servidor)
create table if not exists ai_keys (
  org_id uuid primary key references organizations(id) on delete cascade,
  provider text not null default 'anthropic',
  key_enc text not null,
  key_hint text,
  verified_at timestamptz,
  updated_at timestamptz default now(),
  updated_by uuid
);
alter table ai_keys enable row level security;
-- Sin policies: solo el service role (servidor) puede leer o escribir.

-- 008: reuniones internas del equipo (daily, creativity core, editores) y su aprendizaje en el Laboratorio
alter table calls add column if not exists team_kind text;
alter table lab_entries add column if not exists call_id uuid references calls(id) on delete set null;
alter table organizations add column if not exists team_titles jsonb not null default '[]'::jsonb;

-- 009: roadmap personalizado con IA cuando el cliente completa su Segundo cerebro
alter table client_brain add column if not exists roadmap_status text;   -- generando | listo | error
alter table client_brain add column if not exists roadmap_at timestamptz;
alter table client_brain add column if not exists roadmap_error text;
alter table milestones add column if not exists source text;             -- 'ia' = hito del roadmap personalizado
alter table action_items drop constraint if exists action_items_source_check;
alter table action_items add constraint action_items_source_check check (source in ('fathom','manual','notion','ia','recorrido','roadmap'));

-- 010: cada hito y tarea del roadmap personalizado sabe a qué etapa (módulo) pertenece
alter table milestones add column if not exists module text;
alter table action_items add column if not exists module text;

-- 011: cada reunión del equipo queda también en "Llamadas del equipo" (Notion · Fulfillment)
alter table calls add column if not exists notion_page text;


-- ============================================================
-- 002_roadmap_notion_lab.sql
-- ============================================================
-- Fractal OS · 002 — roadmap por tiempo, conexión con Notion y Laboratorio
-- Idempotente: se puede volver a correr.

-- Bases de Notion de cada cliente
alter table organizations add column if not exists notion_tasks_db text;
alter table organizations add column if not exists notion_roadmap_db text;
alter table organizations add column if not exists notion_calendars jsonb not null default '[]'; -- [{ "id": "...", "label": "Andy" }]
alter table organizations add column if not exists last_synced_at timestamptz;

-- Roadmap: fases (con rango) e hitos (fecha puntual). El estado se calcula por fecha salvo que se fije a mano.
alter table milestones add column if not exists kind text not null default 'hito';
alter table milestones drop constraint if exists milestones_kind_check;
alter table milestones add constraint milestones_kind_check check (kind in ('fase','hito'));
alter table milestones add column if not exists auto_status boolean not null default true;

-- Laboratorio: copia en la app del Atlas de Notion (Notion queda como respaldo y editor alternativo)
create table if not exists lab_entries (
  id          uuid primary key default gen_random_uuid(),
  notion_id   text unique,
  title       text not null,
  tipo        text,      -- Feedback, Falla, Aprendizaje, Hipótesis, Experimento, Decisión, SOP
  area        text,      -- Servicio, Creatividad, Operaciones, Oferta, Comercial, Producto, Finanzas
  estado      text not null default 'Capturado',
  prioridad   text,
  cliente     text,
  responsable text,
  fecha       date,
  fuente      text,
  notas       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table lab_entries enable row level security;
drop policy if exists staff_all on lab_entries;
create policy staff_all on lab_entries for all using (is_staff()) with check (is_staff());
create index if not exists lab_entries_fecha_idx on lab_entries(fecha desc);

-- Fichas del Laboratorio (casos por cliente y criterios). Solo equipo.
create table if not exists lab_pages (
  id         uuid primary key default gen_random_uuid(),
  notion_id  text unique not null,
  section    text not null check (section in ('cliente','criterio')),
  client     text,
  title      text not null,
  happened   text,
  learning   text,
  rule       text,
  summary    text,
  position   int not null default 0
);
alter table lab_pages enable row level security;
drop policy if exists staff_all on lab_pages;
create policy staff_all on lab_pages for all using (is_staff()) with check (is_staff());


-- ============================================================
-- 003_responsable_notion_dirty.sql
-- ============================================================
-- 003 · Responsable por accionable y cola de cambios pendientes de subir a Notion

alter table organizations add column if not exists responsables jsonb not null default '[]'::jsonb;
-- Cada elemento: { "name": "Marcela", "side": "cliente" | "fractal", "notion_user": "<uuid de usuario de Notion, opcional>" }

alter table action_items add column if not exists responsable text;
alter table action_items add column if not exists notion_dirty boolean not null default false;

create index if not exists action_items_dirty_idx on action_items (org_id) where notion_dirty;

-- El cliente solo puede marcar como hecho; el responsable también queda protegido
create or replace function guard_client_action_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_staff() then
    if (new.title, new.org_id, new.call_id, new.parent_id, new.area, new.priority, new.owner, new.due_date, new.position, new.why, new.responsable)
       is distinct from
       (old.title, old.org_id, old.call_id, old.parent_id, old.area, old.priority, old.owner, old.due_date, old.position, old.why, old.responsable) then
      raise exception 'Solo podés marcar accionables como completados';
    end if;
  end if;
  new.done_at := case when new.done and not old.done then now() when not new.done then null else old.done_at end;
  return new;
end $$;


-- ============================================================
-- 004_tracker_fractal.sql
-- ============================================================
-- 004 · Tracker interno de Fractal: tareas del equipo en la cuenta principal, con cliente opcional

alter table organizations add column if not exists notion_client_page text;
alter table action_items add column if not exists client_org_id uuid references organizations(id) on delete set null;


-- ============================================================
-- 005_consulting_brain.sql
-- ============================================================
-- 005 · Clientes de Consulting y su Segundo cerebro

alter table organizations add column if not exists segment text not null default 'b2b';
alter table organizations drop constraint if exists organizations_segment_check;
alter table organizations add constraint organizations_segment_check check (segment in ('b2b', 'consulting'));

-- Respuestas del Segundo cerebro: un JSON por cliente con claves "seccion.campo"
create table if not exists client_brain (
  org_id     uuid primary key references organizations(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table client_brain enable row level security;
drop policy if exists brain_rw on client_brain;
create policy brain_rw on client_brain for all using (can_see_org(org_id)) with check (can_see_org(org_id));

-- Etapas del recorrido: a qué sección del Segundo cerebro corresponde cada fase y cada tarea
alter table milestones add column if not exists brain_section text;
alter table action_items add column if not exists brain_section text;

-- Las tareas del recorrido tienen su propio origen
alter table action_items drop constraint if exists action_items_source_check;
alter table action_items add constraint action_items_source_check check (source in ('fathom','manual','notion','ia','recorrido'));


-- ============================================================
-- 006_knowledge.sql
-- ============================================================
-- 006 · Base de Conocimiento de Fractal (bóveda de documentos para la IA). Solo equipo.

create table if not exists kb_documents (
  id          uuid primary key default gen_random_uuid(),
  source_id   text unique,                -- id del archivo en Google Drive
  title       text not null,
  category    text,                       -- Ops, Setting, Closing, Ofertas…
  module      text,                       -- módulo del curso (icp, oferta, brand, …)
  source_url  text,
  kind        text,                       -- doc, sheet, pdf, docx
  content     text,
  chars       int generated always as (coalesce(length(content), 0)) stored,
  summary     text,
  status      text not null default 'ok', -- ok, sin_acceso, sin_texto
  note        text,
  updated_at  timestamptz not null default now()
);
alter table kb_documents enable row level security;
drop policy if exists staff_all on kb_documents;
create policy staff_all on kb_documents for all using (is_staff()) with check (is_staff());

-- Tokens para cargar documentos desde el navegador (se guarda solo el hash)
create table if not exists ingest_tokens (
  token_hash text primary key,
  label      text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table ingest_tokens enable row level security;


-- ============================================================
-- 007_ai_keys.sql
-- ============================================================
-- 007: API key de Anthropic propia de cada cliente de consultoría (cifrada; solo la lee el servidor)
create table if not exists ai_keys (
  org_id uuid primary key references organizations(id) on delete cascade,
  provider text not null default 'anthropic',
  key_enc text not null,
  key_hint text,
  verified_at timestamptz,
  updated_at timestamptz default now(),
  updated_by uuid
);
alter table ai_keys enable row level security;
-- Sin policies: solo el service role (servidor) puede leer o escribir.


-- ============================================================
-- 008_team_calls.sql
-- ============================================================
-- 008: reuniones internas del equipo (daily, creativity core, editores) y su aprendizaje en el Laboratorio
alter table calls add column if not exists team_kind text;
alter table lab_entries add column if not exists call_id uuid references calls(id) on delete set null;
alter table organizations add column if not exists team_titles jsonb not null default '[]'::jsonb;


-- ============================================================
-- 009_roadmap_ia.sql
-- ============================================================
-- 009: roadmap personalizado con IA cuando el cliente completa su Segundo cerebro
alter table client_brain add column if not exists roadmap_status text;   -- generando | listo | error
alter table client_brain add column if not exists roadmap_at timestamptz;
alter table client_brain add column if not exists roadmap_error text;
alter table milestones add column if not exists source text;             -- 'ia' = hito del roadmap personalizado
alter table action_items drop constraint if exists action_items_source_check;
alter table action_items add constraint action_items_source_check check (source in ('fathom','manual','notion','ia','recorrido','roadmap'));


-- ============================================================
-- 010_journey_module.sql
-- ============================================================
-- 010: cada hito y tarea del roadmap personalizado sabe a qué etapa (módulo) pertenece
alter table milestones add column if not exists module text;
alter table action_items add column if not exists module text;


-- ============================================================
-- 011_team_calls_notion.sql
-- ============================================================
-- 011: cada reunión del equipo queda también en "Llamadas del equipo" (Notion · Fulfillment)
alter table calls add column if not exists notion_page text;


-- ============================================================
-- 012_verticales.sql
-- ============================================================
-- 012 · Verticales de Fractal (Consulting, Creative Lab, Baseline, Marcas personales, B2B)
alter table action_items add column if not exists vertical text;
alter table organizations add column if not exists vertical text;


-- ============================================================
-- 013_finanzas.sql
-- ============================================================
-- 013 · Finanzas del negocio (espejo de "Tabla de Finanzas FRACTAL"; lo personal queda solo en la planilla)
create table if not exists finance_movements (
  id         uuid primary key default gen_random_uuid(),
  month      text not null check (month ~ '^\d{4}-\d{2}$'),       -- 2026-10
  kind       text not null check (kind in ('ingreso', 'gasto')),
  date       date,
  detail     text not null,
  billed     numeric(12,2) not null default 0,   -- ingreso: facturado
  cash       numeric(12,2),                       -- ingreso: cobrado (null = pendiente)
  amount     numeric(12,2) not null default 0,   -- gasto: monto
  tag        text,                                -- B2B/B2C o Equipo/Software/Comisiones
  method     text,
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists finance_movements_month_idx on finance_movements (month);

create table if not exists finance_settings (
  id         int primary key default 1 check (id = 1),
  petty_pct  numeric(5,4) not null default 0.10,  -- caja chica sobre el profit
  sheet_url  text,
  updated_at timestamptz not null default now()
);
insert into finance_settings (id) values (1) on conflict do nothing;

-- Sin políticas: solo el servidor (service role) lee y escribe. La app además filtra por mail (Mateo y Lorena).
alter table finance_movements enable row level security;
alter table finance_settings enable row level security;


-- ============================================================
-- 014_instagram.sql
-- ============================================================
-- 014 · Laboratorio de contenido: Instagram conectado por cliente
create table if not exists ig_accounts (
  org_id          uuid primary key references organizations(id) on delete cascade,
  ig_user_id      text not null,
  username        text,
  name            text,
  picture         text,
  account_type    text,
  followers       int,
  follows         int,
  media_count     int,
  token           text not null,          -- cifrado (lib/secrets)
  token_expires_at timestamptz,
  connected_by    uuid,
  connected_at    timestamptz not null default now(),
  last_sync_at    timestamptz,
  last_error      text
);

create table if not exists ig_media (
  id              text primary key,       -- id de Instagram
  org_id          uuid not null references organizations(id) on delete cascade,
  caption         text,
  media_type      text,                   -- IMAGE / VIDEO / CAROUSEL_ALBUM
  product_type    text,                   -- FEED / REELS / STORY
  permalink       text,
  thumbnail       text,
  posted_at       timestamptz,
  views           int, reach int, likes int, comments int, saved int, shares int,
  interactions    int, follows int, profile_visits int,
  avg_watch_ms    int,
  updated_at      timestamptz not null default now()
);
create index if not exists ig_media_org_idx on ig_media (org_id, posted_at desc);

-- Foto de cada pieza en el tiempo, para ver cómo crece
create table if not exists ig_media_snapshots (
  media_id  text not null references ig_media(id) on delete cascade,
  at        timestamptz not null default now(),
  views int, reach int, interactions int, follows int,
  primary key (media_id, at)
);

-- Una fila por día y cuenta (seguidores los guardamos nosotros: Instagram no da el histórico)
create table if not exists ig_daily (
  org_id     uuid not null references organizations(id) on delete cascade,
  day        date not null,
  followers  int,
  reach int, views int, engaged int, interactions int, profile_views int,
  primary key (org_id, day)
);

alter table ig_accounts enable row level security;
alter table ig_media enable row level security;
alter table ig_media_snapshots enable row level security;
alter table ig_daily enable row level security;

-- Lectura: el equipo y la gente del cliente (el token nunca se lee desde el cliente: la app usa el service role)
drop policy if exists ig_media_read on ig_media;
create policy ig_media_read on ig_media for select using (can_see_org(org_id));
drop policy if exists ig_daily_read on ig_daily;
create policy ig_daily_read on ig_daily for select using (can_see_org(org_id));
drop policy if exists ig_snap_read on ig_media_snapshots;
create policy ig_snap_read on ig_media_snapshots for select using (exists (select 1 from ig_media m where m.id = media_id and can_see_org(m.org_id)));


-- ============================================================
-- 015_instagram_dashboard.sql
-- ============================================================
-- 015 · Dashboard tipo Instagram: seguidores ganados por día, reposts y resumen por período
alter table ig_daily add column if not exists new_followers int;
alter table ig_media add column if not exists reposts int;
alter table ig_accounts add column if not exists summary jsonb;


-- ============================================================
-- 016_instagram_multi.sql
-- ============================================================
-- 016 · Varias cuentas de Instagram por cliente (ej. Brainzeed + Marcela)
alter table ig_accounts drop constraint if exists ig_accounts_pkey;
alter table ig_accounts add primary key (org_id, ig_user_id);

alter table ig_media add column if not exists ig_user_id text;
update ig_media m set ig_user_id = a.ig_user_id from ig_accounts a where a.org_id = m.org_id and m.ig_user_id is null;
create index if not exists ig_media_acc_idx on ig_media (org_id, ig_user_id, posted_at desc);

alter table ig_daily add column if not exists ig_user_id text;
update ig_daily d set ig_user_id = a.ig_user_id from ig_accounts a where a.org_id = d.org_id and d.ig_user_id is null;
update ig_daily set ig_user_id = '' where ig_user_id is null;
alter table ig_daily alter column ig_user_id set not null;
alter table ig_daily drop constraint if exists ig_daily_pkey;
alter table ig_daily add primary key (org_id, ig_user_id, day);


-- ============================================================
-- 017_semaforo_workflow.sql
-- ============================================================
-- 017 · Semáforo de clientes, KPIs semanales, workflow por cliente y contenido completo del Laboratorio

-- Laboratorio: el cuerpo de la página de Notion (ej. transcripciones completas)
alter table lab_entries add column if not exists body text;
alter table lab_entries add column if not exists notion_edited timestamptz;

-- Workflow semanal del cliente (lo ve el cliente en su portal): [{ "dow": 2, "title": "...", "side": "fractal", "responsable": "Nacho" }]
alter table organizations add column if not exists workflow jsonb not null default '[]'::jsonb;

-- Semáforo: solo equipo
create table if not exists client_health (
  org_id      uuid primary key references organizations(id) on delete cascade,
  color       text check (color in ('verde','amarillo','rojo')),
  importance  text check (importance in ('alta','media','baja')),
  note        text,
  updated_by  text,
  updated_at  timestamptz not null default now()
);

create table if not exists client_health_log (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  color       text check (color in ('verde','amarillo','rojo')),
  note        text,
  author      text,
  created_at  timestamptz not null default now()
);
create index if not exists client_health_log_org_idx on client_health_log (org_id, created_at desc);

-- KPIs de la semana por cliente (plan vs. real)
create table if not exists client_kpis (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  week        date not null,                 -- lunes de la semana
  name        text not null,
  target      numeric not null default 0,    -- meta de la semana
  actual      numeric not null default 0,
  daily       boolean not null default true, -- true: el plan se reparte por día (plan a la fecha)
  position    int not null default 0,
  updated_at  timestamptz not null default now()
);
create index if not exists client_kpis_org_week_idx on client_kpis (org_id, week);

alter table client_health enable row level security;
alter table client_health_log enable row level security;
alter table client_kpis enable row level security;
drop policy if exists staff_all on client_health;
create policy staff_all on client_health for all using (is_staff()) with check (is_staff());
drop policy if exists staff_all on client_health_log;
create policy staff_all on client_health_log for all using (is_staff()) with check (is_staff());
drop policy if exists staff_all on client_kpis;
create policy staff_all on client_kpis for all using (is_staff()) with check (is_staff());


-- ============================================================
-- 018_eod_strikes.sql
-- ============================================================
-- 018 · Reporte del día (EOD), KPIs por día y strikes

alter table client_kpis add column if not exists owner text default 'Nacho';

-- Valor de cada KPI por día (el real de la semana es la suma)
create table if not exists kpi_daily (
  kpi_id     uuid not null references client_kpis(id) on delete cascade,
  day        date not null,
  value      numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (kpi_id, day)
);

-- Reporte del día del equipo (reemplaza el formulario de Notion; se copia a Fulfillment Reports)
create table if not exists daily_reports (
  id         uuid primary key default gen_random_uuid(),
  day        date not null,
  author     text not null,
  done       text,
  pending    text,
  blockers   text,
  published  numeric,
  planned    numeric,
  notion_id  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day, author)
);

-- Strikes: dos días seguidos de incumplimiento
create table if not exists strikes (
  id         uuid primary key default gen_random_uuid(),
  day        date not null,
  kind       text not null check (kind in ('kpi','reporte')),
  subject    text not null,
  org_id     uuid references organizations(id) on delete cascade,
  owner      text,
  reason     text,
  status     text not null default 'abierto' check (status in ('abierto','cerrado')),
  measure    text,
  closed_by  text,
  created_at timestamptz not null default now(),
  unique (kind, subject, day)
);

alter table kpi_daily enable row level security;
alter table daily_reports enable row level security;
alter table strikes enable row level security;
drop policy if exists staff_all on kpi_daily;
create policy staff_all on kpi_daily for all using (is_staff()) with check (is_staff());
drop policy if exists staff_all on daily_reports;
create policy staff_all on daily_reports for all using (is_staff()) with check (is_staff());
drop policy if exists staff_all on strikes;
create policy staff_all on strikes for all using (is_staff()) with check (is_staff());


-- ============================================================
-- 019_vault.sql
-- ============================================================
-- 019 · Bóveda de reportes de Fractal (espejo de la base de Notion dentro de Fulfillment)
create table if not exists vault_reports (
  id            uuid primary key default gen_random_uuid(),
  notion_id     text unique not null,
  title         text not null,
  tipo          text,
  week_start    date,
  week_end      date,
  clientes      text[] not null default '{}',
  resumen       text,
  body_md       text,
  notion_edited timestamptz,
  updated_at    timestamptz not null default now()
);
alter table vault_reports enable row level security;
drop policy if exists staff_all on vault_reports;
create policy staff_all on vault_reports for all using (is_staff()) with check (is_staff());


-- ============================================================
-- 020_eod_general.sql
-- ============================================================
-- 020 · Reporte del día general de Fractal (como el de Notion)
alter table daily_reports add column if not exists next_steps text;
alter table daily_reports add column if not exists top_content text;
alter table daily_reports add column if not exists notes text;

-- ============================================================
-- Permisos de la API de datos (Supabase).
-- Los proyectos nuevos de Supabase ya no dan acceso automático a las tablas creadas por SQL.
-- Todas las tablas tienen Row Level Security, así que las políticas siguen decidiendo qué ve cada quien.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema public grant execute on functions to authenticated, service_role;
notify pgrst, 'reload schema';
