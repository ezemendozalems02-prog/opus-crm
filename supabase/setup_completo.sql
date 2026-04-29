-- =====================================================
-- OPUS PROSPECT CRM — SETUP COMPLETO
-- Ejecutar en: Supabase → SQL Editor → New Query
-- Es seguro correrlo incluso si ya existe perfiles.
-- =====================================================

-- 1. RUBROS
create table if not exists rubros (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  problema_comun text,
  oportunidad text,
  tipo_cliente text,
  mensaje_sugerido text,
  created_at timestamptz default now()
);

-- 2. PROSPECTOS
create table if not exists prospectos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  negocio text not null,
  rubro_id uuid references rubros(id) on delete set null,
  ciudad text,
  instagram text,
  whatsapp text,
  sitio_web text,
  estado text not null default 'Nuevo' check (estado in ('Nuevo','Contactado','Respondió','Interesado','Reunión','Propuesta','Ganado','Perdido')),
  nivel_interes integer default 1 check (nivel_interes between 1 and 5),
  score integer default 0,
  ultimo_contacto timestamptz,
  proximo_seguimiento timestamptz,
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. ACTIVIDADES
create table if not exists actividades_prospecto (
  id uuid primary key default gen_random_uuid(),
  prospecto_id uuid not null references prospectos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('mensaje_sent','reply_received','call','meeting','note','status_change')),
  contenido text,
  created_at timestamptz default now()
);

-- 4. SEGUIMIENTOS
create table if not exists seguimientos (
  id uuid primary key default gen_random_uuid(),
  prospecto_id uuid not null references prospectos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descripcion text,
  fecha timestamptz not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','completado','cancelado')),
  created_at timestamptz default now()
);

-- 5. PLANTILLAS
create table if not exists plantillas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  rubro_id uuid references rubros(id) on delete set null,
  tipo text not null check (tipo in ('initial','followup','reenganche','closing')),
  titulo text not null,
  contenido text not null,
  created_at timestamptz default now()
);

-- 6. CAMPAÑAS
create table if not exists campañas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  rubro_id uuid references rubros(id) on delete set null,
  objetivo text,
  estado text default 'activa' check (estado in ('activa','pausada','finalizada')),
  created_at timestamptz default now()
);

-- 7. CAMPAÑA_PROSPECTOS
create table if not exists campaña_prospectos (
  id uuid primary key default gen_random_uuid(),
  campaña_id uuid not null references campañas(id) on delete cascade,
  prospecto_id uuid not null references prospectos(id) on delete cascade,
  created_at timestamptz default now(),
  unique(campaña_id, prospecto_id)
);

-- 8. SUSCRIPCIONES
create table if not exists suscripciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  estado text not null default 'trial' check (estado in ('pendiente','trial','activa','vencida','cancelada','suspendida')),
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

-- 9. PAGOS
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

-- 10. COLUMNAS SAAS EN PERFILES (seguro si ya existen)
alter table perfiles add column if not exists rol text not null default 'cliente' check (rol in ('super_admin','cliente'));
alter table perfiles add column if not exists estado_cuenta text not null default 'trial' check (estado_cuenta in ('demo','trial','activa','vencida','suspendida'));
alter table perfiles add column if not exists habilitado boolean not null default true;
alter table perfiles add column if not exists es_demo boolean not null default false;
alter table perfiles add column if not exists trial_inicio timestamptz;
alter table perfiles add column if not exists trial_fin timestamptz;
alter table perfiles add column if not exists ultimo_acceso timestamptz;

-- =====================================================
-- RLS
-- =====================================================

alter table rubros enable row level security;
alter table prospectos enable row level security;
alter table actividades_prospecto enable row level security;
alter table seguimientos enable row level security;
alter table plantillas enable row level security;
alter table campañas enable row level security;
alter table campaña_prospectos enable row level security;
alter table suscripciones enable row level security;
alter table pagos enable row level security;

-- Función super admin
create or replace function es_super_admin()
returns boolean as $$
begin
  return exists (
    select 1 from perfiles where id = auth.uid() and rol = 'super_admin'
  );
end;
$$ language plpgsql security definer;

-- Perfiles
drop policy if exists "Perfiles legibles por el dueño" on perfiles;
drop policy if exists "Perfiles legibles por el dueño o admin" on perfiles;
create policy "Perfiles legibles" on perfiles
  for select using (auth.uid() = id or es_super_admin());

drop policy if exists "Perfiles editables por el dueño" on perfiles;
drop policy if exists "Perfiles editables por el dueño o admin" on perfiles;
create policy "Perfiles editables" on perfiles
  for update using (auth.uid() = id or es_super_admin());

drop policy if exists "Perfiles insertables" on perfiles;
create policy "Perfiles insertables" on perfiles
  for insert with check (auth.uid() = id or es_super_admin());

-- Rubros
drop policy if exists "Rubros legibles por todos los autenticados" on rubros;
drop policy if exists "Rubros insertables por autenticados" on rubros;
drop policy if exists "Rubros editables por autenticados" on rubros;
create policy "Rubros select" on rubros for select using (auth.role() = 'authenticated');
create policy "Rubros insert" on rubros for insert with check (auth.role() = 'authenticated');
create policy "Rubros update" on rubros for update using (auth.role() = 'authenticated');
create policy "Rubros delete" on rubros for delete using (auth.role() = 'authenticated');

-- Prospectos
drop policy if exists "Prospectos visibles por el dueño" on prospectos;
drop policy if exists "Prospectos visibles por el dueño o admin" on prospectos;
drop policy if exists "Prospectos insertables por el dueño" on prospectos;
drop policy if exists "Prospectos editables por el dueño" on prospectos;
drop policy if exists "Prospectos editables por el dueño o admin" on prospectos;
drop policy if exists "Prospectos eliminables por el dueño" on prospectos;
create policy "Prospectos select" on prospectos for select using (auth.uid() = user_id or es_super_admin());
create policy "Prospectos insert" on prospectos for insert with check (auth.uid() = user_id);
create policy "Prospectos update" on prospectos for update using (auth.uid() = user_id or es_super_admin());
create policy "Prospectos delete" on prospectos for delete using (auth.uid() = user_id or es_super_admin());

-- Actividades
drop policy if exists "Actividades visibles por el dueño" on actividades_prospecto;
drop policy if exists "Actividades insertables por el dueño" on actividades_prospecto;
create policy "Actividades select" on actividades_prospecto for select using (auth.uid() = user_id);
create policy "Actividades insert" on actividades_prospecto for insert with check (auth.uid() = user_id);

-- Seguimientos
drop policy if exists "Seguimientos visibles por el dueño" on seguimientos;
drop policy if exists "Seguimientos insertables por el dueño" on seguimientos;
drop policy if exists "Seguimientos editables por el dueño" on seguimientos;
drop policy if exists "Seguimientos eliminables por el dueño" on seguimientos;
create policy "Seguimientos select" on seguimientos for select using (auth.uid() = user_id);
create policy "Seguimientos insert" on seguimientos for insert with check (auth.uid() = user_id);
create policy "Seguimientos update" on seguimientos for update using (auth.uid() = user_id);
create policy "Seguimientos delete" on seguimientos for delete using (auth.uid() = user_id);

-- Plantillas
drop policy if exists "Plantillas visibles por el dueño" on plantillas;
drop policy if exists "Plantillas insertables por el dueño" on plantillas;
drop policy if exists "Plantillas editables por el dueño" on plantillas;
create policy "Plantillas select" on plantillas for select using (auth.uid() = user_id or user_id is null);
create policy "Plantillas insert" on plantillas for insert with check (auth.uid() = user_id);
create policy "Plantillas update" on plantillas for update using (auth.uid() = user_id);
create policy "Plantillas delete" on plantillas for delete using (auth.uid() = user_id);

-- Campañas
drop policy if exists "Campañas visibles por el dueño" on campañas;
drop policy if exists "Campañas insertables por el dueño" on campañas;
drop policy if exists "Campañas editables por el dueño" on campañas;
create policy "Campañas select" on campañas for select using (auth.uid() = user_id or es_super_admin());
create policy "Campañas insert" on campañas for insert with check (auth.uid() = user_id);
create policy "Campañas update" on campañas for update using (auth.uid() = user_id or es_super_admin());
create policy "Campañas delete" on campañas for delete using (auth.uid() = user_id or es_super_admin());

-- Campaña_Prospectos
drop policy if exists "Campaña_Prospectos visibles por el dueño" on campaña_prospectos;
drop policy if exists "Campaña_Prospectos insertables por el dueño" on campaña_prospectos;
create policy "Campaña_Prospectos select" on campaña_prospectos for select using (
  exists (select 1 from campañas where id = campaña_id and user_id = auth.uid())
);
create policy "Campaña_Prospectos insert" on campaña_prospectos for insert with check (
  exists (select 1 from campañas where id = campaña_id and user_id = auth.uid())
);

-- Suscripciones
drop policy if exists "Suscripciones visibles por el dueño o admin" on suscripciones;
drop policy if exists "Suscripciones editables por admin" on suscripciones;
create policy "Suscripciones select" on suscripciones for select using (auth.uid() = user_id or es_super_admin());
create policy "Suscripciones update" on suscripciones for update using (auth.uid() = user_id or es_super_admin());
create policy "Suscripciones insert" on suscripciones for insert with check (auth.uid() = user_id or es_super_admin());

-- Pagos
drop policy if exists "Pagos visibles por el dueño o admin" on pagos;
create policy "Pagos select" on pagos for select using (auth.uid() = user_id or es_super_admin());
create policy "Pagos insert" on pagos for insert with check (auth.uid() = user_id or es_super_admin());

-- =====================================================
-- TRIGGERS
-- =====================================================

-- updated_at genérico
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_prospectos_updated_at on prospectos;
create trigger set_prospectos_updated_at
  before update on prospectos
  for each row execute function handle_updated_at();

drop trigger if exists set_suscripciones_updated_at on suscripciones;
create trigger set_suscripciones_updated_at
  before update on suscripciones
  for each row execute function handle_updated_at();

-- Trigger: crear perfil automáticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, email, nombre, rol, estado_cuenta, habilitado, trial_inicio, trial_fin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nombre',
    'cliente',
    'trial',
    true,
    now(),
    now() + interval '7 days'
  )
  on conflict (id) do nothing;

  insert into public.suscripciones (user_id, estado, trial_inicio, trial_fin)
  values (new.id, 'trial', now(), now() + interval '7 days')
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
