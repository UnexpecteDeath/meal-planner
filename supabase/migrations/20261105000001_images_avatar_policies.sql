begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "plate images avatar select own" on storage.objects;
create policy "plate images avatar select own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'images'
    and name = ((select auth.uid())::text || '/avatar')
  );

drop policy if exists "plate images avatar insert own" on storage.objects;
create policy "plate images avatar insert own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'images'
    and name = ((select auth.uid())::text || '/avatar')
  );

drop policy if exists "plate images avatar update own" on storage.objects;
create policy "plate images avatar update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'images'
    and name = ((select auth.uid())::text || '/avatar')
  )
  with check (
    bucket_id = 'images'
    and name = ((select auth.uid())::text || '/avatar')
  );

commit;
