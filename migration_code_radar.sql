-- Code Radar — Session 1
-- Snapshots d'agrégats par source nationale (le "radar" = la série temporelle)

create table if not exists code_radar_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id varchar(40) not null,
  country varchar(2) not null,
  captured_at timestamptz not null default now(),
  status varchar(10) not null default 'ok' check (status in ('ok','error')),
  payload jsonb,
  error text
);

create index if not exists crs_source_captured_idx
  on code_radar_snapshots (source_id, captured_at desc);

create index if not exists crs_country_idx
  on code_radar_snapshots (country);

alter table code_radar_snapshots enable row level security;

drop policy if exists code_radar_snapshots_public_read on code_radar_snapshots;
create policy code_radar_snapshots_public_read
  on code_radar_snapshots for select
  using (true);
