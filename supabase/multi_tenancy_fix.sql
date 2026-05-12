-- Opus Prospect CRM - Multi-tenancy Fix
-- Ejecutar en el Editor SQL de Supabase

-- 1. ASEGURAR COLUMNAS DE USUARIO
alter table rubros add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2. HABILITAR RLS EN TODAS LAS TABLAS CRÍTICAS
alter table rubros enable row level security;
alter table prospectos enable row level security;
alter table actividades_prospecto enable row level security;
alter table seguimientos enable row level security;
alter table plantillas enable row level security;
alter table campañas enable row level security;
alter table campaña_prospectos enable row level security;

-- 3. POLÍTICAS PARA RUBROS (Nichos)
-- Permitir ver los globales (user_id is null) o los propios
drop policy if exists "Rubros select" on rubros;
create policy "Rubros select" on rubros for select using (auth.uid() = user_id or user_id is null or auth.role() = 'authenticated'); 
-- Nota: 'authenticated' permite ver los pre-cargados que no tienen user_id.

drop policy if exists "Rubros insert" on rubros;
create policy "Rubros insert" on rubros for insert with check (auth.uid() = user_id);

drop policy if exists "Rubros update" on rubros;
create policy "Rubros update" on rubros for update using (auth.uid() = user_id);

drop policy if exists "Rubros delete" on rubros;
create policy "Rubros delete" on rubros for delete using (auth.uid() = user_id);

-- 4. POLÍTICAS PARA PROSPECTOS (Clientes)
drop policy if exists "Prospectos select" on prospectos;
create policy "Prospectos select" on prospectos for select using (auth.uid() = user_id);

drop policy if exists "Prospectos insert" on prospectos;
create policy "Prospectos insert" on prospectos for insert with check (auth.uid() = user_id);

drop policy if exists "Prospectos update" on prospectos;
create policy "Prospectos update" on prospectos for update using (auth.uid() = user_id);

drop policy if exists "Prospectos delete" on prospectos;
create policy "Prospectos delete" on prospectos for delete using (auth.uid() = user_id);

-- 5. POLÍTICAS PARA PLANTILLAS
drop policy if exists "Plantillas select" on plantillas;
create policy "Plantillas select" on plantillas for select using (auth.uid() = user_id or user_id is null);

drop policy if exists "Plantillas insert" on plantillas;
create policy "Plantillas insert" on plantillas for insert with check (auth.uid() = user_id);

-- 6. POLÍTICAS PARA CAMPAÑAS
drop policy if exists "Campañas select" on campañas;
create policy "Campañas select" on campañas for select using (auth.uid() = user_id);

drop policy if exists "Campañas insert" on campañas;
create policy "Campañas insert" on campañas for insert with check (auth.uid() = user_id);

-- 7. POLÍTICAS PARA ACTIVIDADES Y SEGUIMIENTOS
drop policy if exists "Actividades select" on actividades_prospecto;
create policy "Actividades select" on actividades_prospecto for select using (auth.uid() = user_id);

drop policy if exists "Seguimientos select" on seguimientos;
create policy "Seguimientos select" on seguimientos for select using (auth.uid() = user_id);

-- 8. LIMPIEZA DE POLÍTICAS PERMISIVAS ANTIGUAS (Si existieran de versiones previas)
drop policy if exists "Allow all for authenticated" on leads;
drop policy if exists "Rubros legibles por todos los autenticados" on rubros;
drop policy if exists "Prospectos visibles por todos" on prospectos;
