-- Opus Prospect CRM - Esquema de Base de Datos
-- Ejecutar en el Editor SQL de Supabase

-- 1. PERFILES (Extensión de auth.users)
create table if not exists perfiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  nombre text,
  created_at timestamptz default now()
);

-- 2. RUBROS
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

-- 3. PROSPECTOS
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
  estado text not null default 'Nuevo' check (estado in ('Nuevo', 'Contactado', 'Respondió', 'Interesado', 'Reunión', 'Propuesta', 'Ganado', 'Perdido')),
  nivel_interes integer default 1 check (nivel_interes between 1 and 5),
  score integer default 0,
  ultimo_contacto timestamptz,
  proximo_seguimiento timestamptz,
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. ACTIVIDADES PROSPECTO
create table if not exists actividades_prospecto (
  id uuid primary key default gen_random_uuid(),
  prospecto_id uuid not null references prospectos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('mensaje_sent', 'reply_received', 'call', 'meeting', 'note', 'status_change')),
  contenido text,
  created_at timestamptz default now()
);

-- 5. SEGUIMIENTOS
create table if not exists seguimientos (
  id uuid primary key default gen_random_uuid(),
  prospecto_id uuid not null references prospectos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descripcion text,
  fecha timestamptz not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'completado', 'cancelado')),
  created_at timestamptz default now()
);

-- 6. PLANTILLAS
create table if not exists plantillas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  rubro_id uuid references rubros(id) on delete set null,
  tipo text not null check (tipo in ('initial', 'followup', 'reenganche', 'closing')),
  titulo text not null,
  contenido text not null,
  created_at timestamptz default now()
);

-- 7. CAMPAÑAS
create table if not exists campañas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  rubro_id uuid references rubros(id) on delete set null,
  objetivo text,
  estado text default 'activa' check (estado in ('activa', 'pausada', 'finalizada')),
  created_at timestamptz default now()
);

-- 8. CAMPAÑA_PROSPECTOS (Relación muchos a muchos)
create table if not exists campaña_prospectos (
  id uuid primary key default gen_random_uuid(),
  campaña_id uuid not null references campañas(id) on delete cascade,
  prospecto_id uuid not null references prospectos(id) on delete cascade,
  created_at timestamptz default now(),
  unique(campaña_id, prospecto_id)
);

-- 9. METRICAS DIARIAS
create table if not exists metricas_diarias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null default current_date,
  mensajes_enviados integer default 0,
  respuestas integer default 0,
  reuniones integer default 0,
  propuestas integer default 0,
  cierres integer default 0,
  created_at timestamptz default now(),
  unique(user_id, fecha)
);

-- === SEGURIDAD (RLS) ===

alter table perfiles enable row level security;
alter table rubros enable row level security;
alter table prospectos enable row level security;
alter table actividades_prospecto enable row level security;
alter table seguimientos enable row level security;
alter table plantillas enable row level security;
alter table campañas enable row level security;
alter table campaña_prospectos enable row level security;
alter table metricas_diarias enable row level security;

-- Políticas de Rubros (Lectura para todos, escritura solo admin/auth si se desea, por ahora auth)
create policy "Rubros legibles por todos los autenticados" on rubros for select using (auth.role() = 'authenticated');
create policy "Rubros insertables por autenticados" on rubros for insert with check (auth.role() = 'authenticated');
create policy "Rubros editables por autenticados" on rubros for update using (auth.role() = 'authenticated');

-- Políticas para Perfiles
create policy "Perfiles legibles por el dueño" on perfiles for select using (auth.uid() = id);
create policy "Perfiles editables por el dueño" on perfiles for update using (auth.uid() = id);

-- Políticas para Prospectos
create policy "Prospectos visibles por el dueño" on prospectos for select using (auth.uid() = user_id);
create policy "Prospectos insertables por el dueño" on prospectos for insert with check (auth.uid() = user_id);
create policy "Prospectos editables por el dueño" on prospectos for update using (auth.uid() = user_id);
create policy "Prospectos eliminables por el dueño" on prospectos for delete using (auth.uid() = user_id);

-- Políticas para Actividades
create policy "Actividades visibles por el dueño" on actividades_prospecto for select using (auth.uid() = user_id);
create policy "Actividades insertables por el dueño" on actividades_prospecto for insert with check (auth.uid() = user_id);

-- Políticas para Seguimientos
create policy "Seguimientos visibles por el dueño" on seguimientos for select using (auth.uid() = user_id);
create policy "Seguimientos insertables por el dueño" on seguimientos for insert with check (auth.uid() = user_id);
create policy "Seguimientos editables por el dueño" on seguimientos for update using (auth.uid() = user_id);
create policy "Seguimientos eliminables por el dueño" on seguimientos for delete using (auth.uid() = user_id);

-- Políticas para Plantillas
create policy "Plantillas visibles por el dueño" on plantillas for select using (auth.uid() = user_id or user_id is null);
create policy "Plantillas insertables por el dueño" on plantillas for insert with check (auth.uid() = user_id);
create policy "Plantillas editables por el dueño" on plantillas for update using (auth.uid() = user_id);

-- Políticas para Campañas
create policy "Campañas visibles por el dueño" on campañas for select using (auth.uid() = user_id);
create policy "Campañas insertables por el dueño" on campañas for insert with check (auth.uid() = user_id);
create policy "Campañas editables por el dueño" on campañas for update using (auth.uid() = user_id);

-- Políticas para Campaña_Prospectos (A través de la campaña)
create policy "Campaña_Prospectos visibles por el dueño" on campaña_prospectos for select using (
  exists (select 1 from campañas where id = campaña_id and user_id = auth.uid())
);
create policy "Campaña_Prospectos insertables por el dueño" on campaña_prospectos for insert with check (
  exists (select 1 from campañas where id = campaña_id and user_id = auth.uid())
);

-- Políticas para Metricas
create policy "Metricas visibles por el dueño" on metricas_diarias for select using (auth.uid() = user_id);
create policy "Metricas insertables por el dueño" on metricas_diarias for insert with check (auth.uid() = user_id);
create policy "Metricas editables por el dueño" on metricas_diarias for update using (auth.uid() = user_id);

-- === TRIGGERS ===

-- Actualizar updated_at en prospectos
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_prospectos_updated_at
  before update on prospectos
  for each row execute function handle_updated_at();

-- Crear perfil automáticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, new.email, new.raw_user_meta_data->>'nombre');
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
