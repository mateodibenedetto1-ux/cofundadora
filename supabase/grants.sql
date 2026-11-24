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
