-- Bảng CDK codes
create table cdks (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  type text not null default 'PLUS',   -- PLUS, PRO, TEAM...
  status text not null default 'available', -- available | used | expired
  created_at timestamptz default now(),
  used_at timestamptz,
  used_by_email text
);

-- Bảng đơn hàng
create table orders (
  id uuid default gen_random_uuid() primary key,
  cdk_code text not null references cdks(code),
  session_data text not null,
  email text,
  account_type text,
  status text not null default 'pending', -- pending | processing | completed | failed
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index nhanh khi tra cứu
create index idx_cdks_code on cdks(code);
create index idx_orders_cdk on orders(cdk_code);
create index idx_orders_status on orders(status);

-- Tự động cập nhật updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();
