-- Fitlly Supabase Schema
-- Paste this entire file into the Supabase SQL editor and run.

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'wardrobe_category') then
    create type wardrobe_category as enum ('TOPS','BOTTOMS','ACCESSORIES','SHOES','OUTERWEAR');
  end if;

  if not exists (select 1 from pg_type where typname = 'outfit_position_type') then
    create type outfit_position_type as enum ('TOP','BOTTOM','ACCESSORY','SHOE','OUTERWEAR');
  end if;
end$$;

-- Generic updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- RLS: Profile owner can read/write own profile; nobody else
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='profiles_select_own'
  ) then
    create policy profiles_select_own
      on public.profiles for select
      using (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='profiles_insert_self'
  ) then
    create policy profiles_insert_self
      on public.profiles for insert
      with check (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='profiles_update_self'
  ) then
    create policy profiles_update_self
      on public.profiles for update
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;
end$$;

-- wardrobe_items (user-owned items)
create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  category wardrobe_category not null,
  subcategory text,
  color text,
  brand text,
  image_url text,
  image_path text,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_wardrobe_items_updated_at on public.wardrobe_items;
create trigger trg_wardrobe_items_updated_at
  before update on public.wardrobe_items
  for each row
  execute function public.set_updated_at();

create index if not exists wardrobe_items_user_id_idx on public.wardrobe_items(user_id);
create index if not exists wardrobe_items_user_category_idx on public.wardrobe_items(user_id, category);
create index if not exists wardrobe_items_created_at_idx on public.wardrobe_items(created_at desc);

alter table public.wardrobe_items enable row level security;

-- RLS: Owner-only CRUD
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='wardrobe_items' and policyname='wardrobe_items_select_owner'
  ) then
    create policy wardrobe_items_select_owner
      on public.wardrobe_items for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='wardrobe_items' and policyname='wardrobe_items_insert_owner'
  ) then
    create policy wardrobe_items_insert_owner
      on public.wardrobe_items for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='wardrobe_items' and policyname='wardrobe_items_update_owner'
  ) then
    create policy wardrobe_items_update_owner
      on public.wardrobe_items for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='wardrobe_items' and policyname='wardrobe_items_delete_owner'
  ) then
    create policy wardrobe_items_delete_owner
      on public.wardrobe_items for delete
      using (user_id = auth.uid());
  end if;
end$$;

-- outfits (user-owned, optionally public)
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  description text,
  occasion text,
  season text,
  is_public boolean not null default false,
  preview_image_url text,
  likes_count integer not null default 0,
  favorites_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_outfits_updated_at on public.outfits;
create trigger trg_outfits_updated_at
  before update on public.outfits
  for each row
  execute function public.set_updated_at();

create index if not exists outfits_user_id_idx on public.outfits(user_id);
create index if not exists outfits_public_idx on public.outfits(is_public, created_at desc);
create index if not exists outfits_created_at_idx on public.outfits(created_at desc);

-- For existing databases where column might be missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='outfits' and column_name='preview_image_url'
  ) then
    alter table public.outfits add column preview_image_url text;
  end if;
end$$;

alter table public.outfits enable row level security;

-- RLS: Read public or own; write only own
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfits' and policyname='outfits_select_public_or_owner'
  ) then
    create policy outfits_select_public_or_owner
      on public.outfits for select
      using (is_public OR user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfits' and policyname='outfits_insert_owner'
  ) then
    create policy outfits_insert_owner
      on public.outfits for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfits' and policyname='outfits_update_owner'
  ) then
    create policy outfits_update_owner
      on public.outfits for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfits' and policyname='outfits_delete_owner'
  ) then
    create policy outfits_delete_owner
      on public.outfits for delete
      using (user_id = auth.uid());
  end if;
end$$;

-- outfit_items (join outfit -> wardrobe_item with position_type)
create table if not exists public.outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  wardrobe_item_id uuid not null references public.wardrobe_items(id) on delete cascade,
  position_type outfit_position_type not null,
  created_at timestamptz not null default now()
);

create index if not exists outfit_items_outfit_idx on public.outfit_items(outfit_id);
create index if not exists outfit_items_wardrobe_item_idx on public.outfit_items(wardrobe_item_id);

alter table public.outfit_items enable row level security;

-- RLS: Only owner of the outfit can manage outfit_items.
-- Also enforce on insert that the wardrobe_item belongs to the same owner.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_items' and policyname='outfit_items_select_owner'
  ) then
    create policy outfit_items_select_owner
      on public.outfit_items for select
      using (
        exists (select 1 from public.outfits o
                where o.id = outfit_id and o.user_id = auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_items' and policyname='outfit_items_insert_owner'
  ) then
    create policy outfit_items_insert_owner
      on public.outfit_items for insert
      with check (
        exists (select 1 from public.outfits o
                where o.id = outfit_id and o.user_id = auth.uid())
        and
        exists (select 1 from public.wardrobe_items w
                where w.id = wardrobe_item_id and w.user_id = auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_items' and policyname='outfit_items_update_owner'
  ) then
    create policy outfit_items_update_owner
      on public.outfit_items for update
      using (
        exists (select 1 from public.outfits o
                where o.id = outfit_id and o.user_id = auth.uid())
      )
      with check (
        exists (select 1 from public.outfits o
                where o.id = outfit_id and o.user_id = auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_items' and policyname='outfit_items_delete_owner'
  ) then
    create policy outfit_items_delete_owner
      on public.outfit_items for delete
      using (
        exists (select 1 from public.outfits o
                where o.id = outfit_id and o.user_id = auth.uid())
      );
  end if;
end$$;

-- style_preferences (user-owned)
create table if not exists public.style_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preference_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, preference_name)
);

create index if not exists style_preferences_user_idx on public.style_preferences(user_id);

alter table public.style_preferences enable row level security;

-- RLS: owner-only
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='style_preferences' and policyname='style_preferences_select_owner'
  ) then
    create policy style_preferences_select_owner
      on public.style_preferences for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='style_preferences' and policyname='style_preferences_insert_owner'
  ) then
    create policy style_preferences_insert_owner
      on public.style_preferences for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='style_preferences' and policyname='style_preferences_update_owner'
  ) then
    create policy style_preferences_update_owner
      on public.style_preferences for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='style_preferences' and policyname='style_preferences_delete_owner'
  ) then
    create policy style_preferences_delete_owner
      on public.style_preferences for delete
      using (user_id = auth.uid());
  end if;
end$$;

-- outfit_likes (per-user per-outfit like)
create table if not exists public.outfit_likes (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (outfit_id, user_id)
);

create index if not exists outfit_likes_user_idx on public.outfit_likes(user_id);
create index if not exists outfit_likes_outfit_idx on public.outfit_likes(outfit_id);

alter table public.outfit_likes enable row level security;

-- RLS: users can see their own likes; can like public outfits or their own; can delete their own like
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_likes' and policyname='outfit_likes_select_own'
  ) then
    create policy outfit_likes_select_own
      on public.outfit_likes for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_likes' and policyname='outfit_likes_insert_rules'
  ) then
    create policy outfit_likes_insert_rules
      on public.outfit_likes for insert
      with check (
        user_id = auth.uid()
        and exists (
          select 1 from public.outfits o
          where o.id = outfit_id
            and (o.is_public or o.user_id = auth.uid())
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_likes' and policyname='outfit_likes_delete_own'
  ) then
    create policy outfit_likes_delete_own
      on public.outfit_likes for delete
      using (user_id = auth.uid());
  end if;
end$$;

-- outfit_favorites (per-user per-outfit favorite)
create table if not exists public.outfit_favorites (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (outfit_id, user_id)
);

create index if not exists outfit_favorites_user_idx on public.outfit_favorites(user_id);
create index if not exists outfit_favorites_outfit_idx on public.outfit_favorites(outfit_id);

alter table public.outfit_favorites enable row level security;

-- RLS: users can see their own favorites; can favorite public outfits or their own; can delete their own favorite
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_favorites' and policyname='outfit_favorites_select_own'
  ) then
    create policy outfit_favorites_select_own
      on public.outfit_favorites for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_favorites' and policyname='outfit_favorites_insert_rules'
  ) then
    create policy outfit_favorites_insert_rules
      on public.outfit_favorites for insert
      with check (
        user_id = auth.uid()
        and exists (
          select 1 from public.outfits o
          where o.id = outfit_id
            and (o.is_public or o.user_id = auth.uid())
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='outfit_favorites' and policyname='outfit_favorites_delete_own'
  ) then
    create policy outfit_favorites_delete_own
      on public.outfit_favorites for delete
      using (user_id = auth.uid());
  end if;
end$$;

-- RPCs used in code: increment/decrement likes and favorites
-- Note: we REVOKE execute from anon/public and grant to authenticated only.
create or replace function public.increment_outfit_likes(outfit_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.outfits
     set likes_count = greatest(0, coalesce(likes_count,0) + 1),
         updated_at = now()
   where id = outfit_id;
$$;

create or replace function public.decrement_outfit_likes(outfit_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.outfits
     set likes_count = greatest(0, coalesce(likes_count,0) - 1),
         updated_at = now()
   where id = outfit_id;
$$;

create or replace function public.increment_outfit_favorites(outfit_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.outfits
     set favorites_count = greatest(0, coalesce(favorites_count,0) + 1),
         updated_at = now()
   where id = outfit_id;
$$;

create or replace function public.decrement_outfit_favorites(outfit_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.outfits
     set favorites_count = greatest(0, coalesce(favorites_count,0) - 1),
         updated_at = now()
   where id = outfit_id;
$$;

revoke all on function public.increment_outfit_likes(uuid) from public;
revoke all on function public.decrement_outfit_likes(uuid) from public;
revoke all on function public.increment_outfit_favorites(uuid) from public;
revoke all on function public.decrement_outfit_favorites(uuid) from public;

grant execute on function public.increment_outfit_likes(uuid) to authenticated;
grant execute on function public.decrement_outfit_likes(uuid) to authenticated;
grant execute on function public.increment_outfit_favorites(uuid) to authenticated;
grant execute on function public.decrement_outfit_favorites(uuid) to authenticated;

-- Storage bucket for future uploads (optional but recommended)
-- Use object keys like `${auth.uid()}/filename.jpg` to satisfy policies.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'wardrobe') then
    perform storage.create_bucket('wardrobe', public => true);
  end if;
end$$;

-- Storage policies for 'wardrobe' bucket
-- Public read; owners can CRUD within their own folder prefix `${auth.uid()}/...`
do $$
begin
  -- Read for everyone (since bucket is public)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'wardrobe_read_public'
  ) then
    create policy "wardrobe_read_public"
      on storage.objects for select
      using (bucket_id = 'wardrobe');
  end if;

  -- Insert by owner to their own folder
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'wardrobe_insert_owner_prefix'
  ) then
    create policy "wardrobe_insert_owner_prefix"
      on storage.objects for insert
      with check (
        bucket_id = 'wardrobe'
        and (auth.uid() is not null)
        and position(auth.uid()::text || '/' in coalesce(name, '')) = 1
      );
  end if;

  -- Update by owner within their own folder
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'wardrobe_update_owner_prefix'
  ) then
    create policy "wardrobe_update_owner_prefix"
      on storage.objects for update
      using (
        bucket_id = 'wardrobe'
        and (auth.uid() is not null)
        and position(auth.uid()::text || '/' in coalesce(name, '')) = 1
      )
      with check (
        bucket_id = 'wardrobe'
        and (auth.uid() is not null)
        and position(auth.uid()::text || '/' in coalesce(name, '')) = 1
      );
  end if;

  -- Delete by owner within their own folder
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'wardrobe_delete_owner_prefix'
  ) then
    create policy "wardrobe_delete_owner_prefix"
      on storage.objects for delete
      using (
        bucket_id = 'wardrobe'
        and (auth.uid() is not null)
        and position(auth.uid()::text || '/' in coalesce(name, '')) = 1
      );
  end if;
end$$;
