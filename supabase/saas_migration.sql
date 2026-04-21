-- Opus Prospect CRM - SaaS Migration SQL
-- Ejecutar en el Editor SQL de Supabase

-- 1. EXTENDER PERFILES
alter table perfiles add column if not exists rol text not null default 'cliente' check (rol in ('super_admin', 'cliente'));
alter table perfiles add column if not exists estado_cuenta text not null default 'trial' check (estado_cuenta in ('demo', 'trial', 'activa', 'vencida', 'suspendida'));
alter table perfiles add column if not exists habilitado boolean not null default true;
alter table perfiles add column if not exists es_demo boolean not null default false;
alter table perfiles add column if not exists trial_inicio timestamptz;
alter table perfiles add column if not exists trial_fin timestamptz;
alter table perfiles add column if not exists ultimo_acceso timestamptz;

-- 2. TABLA SUSCRIPCIONES
create table if not exists suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'trial', 'activa', 'vencida', 'cancelada', 'suspendida')),
  plan text not null default 'mensual',
  precio numeric,
  moneda text default 'ARS',
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  trial_inicio timestamptz,
  trial_fin timestamptz,
  metodo_pago text,
  mercado_pago_preference_id text,
  mercado_pago_payment_id text,
  mercado_pago_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TABLA PAGOS
create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  suscripcion_id uuid references suscripciones(id) on delete set null,
  proveedor text default 'mercado_pago',
  estado text,
  monto numeric,
  moneda text default 'ARS',
  external_reference text,
  payment_id text,
  preference_id text,
  detalle text,
  created_at timestamptz default now()
);

-- 4. ACTUALIZAR RLS (ACCESO SUPER ADMIN)
-- Habilitar RLS en las nuevas tablas
alter table suscripciones enable row level security;
alter table pagos enable row level security;

-- Función helper para chequear si el usuario es super_admin
create or replace function es_super_admin()
returns boolean as $$
begin
  return exists (
    select 1 from perfiles
    where id = auth.uid() and rol = 'super_admin'
  );
end;
$$ language plpgsql security definer;

-- Actualizar políticas de perfiles
drop policy if exists "Perfiles legibles por el dueño" on perfiles;
create policy "Perfiles legibles por el dueño o admin" on perfiles
  for select using (auth.uid() = id or es_super_admin());

drop policy if exists "Perfiles editables por el dueño" on perfiles;
create policy "Perfiles editables por el dueño o admin" on perfiles
  for update using (auth.uid() = id or es_super_admin());

-- Políticas para Suscripciones
create policy "Suscripciones visibles por el dueño o admin" on suscripciones
  for select using (auth.uid() = user_id or es_super_admin());
create policy "Suscripciones editables por admin" on suscripciones
  for update using (es_super_admin());

-- Políticas para Pagos
create policy "Pagos visibles por el dueño o admin" on pagos
  for select using (auth.uid() = user_id or es_super_admin());

-- Actualizar políticas de otras tablas para permitir acceso total al admin
drop policy if exists "Prospectos visibles por el dueño" on prospectos;
create policy "Prospectos visibles por el dueño o admin" on prospectos
  for select using (auth.uid() = user_id or es_super_admin());

drop policy if exists "Prospectos editables por el dueño" on prospectos;
create policy "Prospectos editables por el dueño o admin" on prospectos
  for update using (auth.uid() = user_id or es_super_admin());

-- Hacer lo mismo con actividades, seguimientos, plantillas, campañas, metricas si es necesario
-- Por brevedad, aplicaremos el patrón "or es_super_admin()" a las más críticas.

-- 5. ACTUALIZAR TRIGGER DE NUEVO USUARIO
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (
    id, 
    email, 
    nombre, 
    rol, 
    estado_cuenta, 
    trial_inicio, 
    trial_fin
  )
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'nombre',
    'cliente',
    'trial',
    now(),
    now() + interval '7 days'
  );

  -- Crear suscripción inicial en trial
  insert into public.suscripciones (
    user_id,
    estado,
    trial_inicio,
    trial_fin
  )
  values (
    new.id,
    'trial',
    now(),
    now() + interval '7 days'
  );

  return new;
end;
$$ language plpgsql security definer;

-- 6. TRIGGER PARA UPDATED_AT EN SUSCRIPCIONES
create trigger set_suscripciones_updated_at
  before update on suscripciones
  for each row execute function handle_updated_at();

-- 7. NOTA: Para convertirte en super_admin, ejecuta:
-- update perfiles set rol = 'super_admin' where email = 'tu-email@ejemplo.com';
