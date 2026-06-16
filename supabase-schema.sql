-- Tabla de hijos
create table children (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color text not null default '#3b82f6',
  created_at timestamp with time zone default now()
);

-- Tabla de actividades de cada hijo
create table activities (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade,
  name text not null,
  day_of_week text not null,
  time text,
  location text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Tabla de eventos
create table events (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete set null,
  title text not null,
  description text default '',
  event_date date not null,
  event_time text,
  notes text,
  needs_to_bring text,
  dress_code text,
  source text default 'manual' check (source in ('manual', 'whatsapp')),
  calendar_uid text,
  created_at timestamp with time zone default now()
);

-- Permisos para acceso público (solo lectura/escritura desde la app)
alter table children enable row level security;
alter table activities enable row level security;
alter table events enable row level security;

create policy "Allow all" on children for all using (true);
create policy "Allow all" on activities for all using (true);
create policy "Allow all" on events for all using (true);
