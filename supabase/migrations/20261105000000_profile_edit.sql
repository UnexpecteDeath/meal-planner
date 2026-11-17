-- The application already reads public.profiles (id, display_name, avatar_url, created_at).
alter table public.profiles enable row level security;

grant select (id, display_name, avatar_url, created_at),
  insert (id, display_name), update (id, display_name, avatar_url)
  on public.profiles to authenticated;

create policy "plate profiles select own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "plate profiles insert own"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

create policy "plate profiles update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plate-profile-avatars',
  'plate-profile-avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "plate avatars select own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'plate-profile-avatars'
    and name = ((select auth.uid())::text || '/avatar')
  );

create policy "plate avatars insert own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'plate-profile-avatars'
    and name = ((select auth.uid())::text || '/avatar')
  );

create policy "plate avatars update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'plate-profile-avatars'
    and name = ((select auth.uid())::text || '/avatar')
  )
  with check (
    bucket_id = 'plate-profile-avatars'
    and name = ((select auth.uid())::text || '/avatar')
  );
