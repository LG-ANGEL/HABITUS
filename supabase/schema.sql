-- Habitus by VIRTUS ARS · esquema de cuentas administradas
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9._-]{3,32}$'),
  role text not null default 'user' check (role in ('user','admin')),
  active boolean not null default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuario solo puede LEER su propio perfil.
create policy "ver mi perfil" on public.profiles
  for select to authenticated using (id = auth.uid());

-- Sin políticas de insert/update/delete: solo la función admin-users
-- (con service role, en el servidor) puede crear, suspender o eliminar.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
