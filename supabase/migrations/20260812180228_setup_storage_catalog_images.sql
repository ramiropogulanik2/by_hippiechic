insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do nothing;

-- Solo el rol authenticated (admin logueado) o service_role pueden escribir.
-- La lectura es pública porque el bucket es public=true (no necesita policy de select).
create policy "catalog-images: solo admin autenticado puede subir"
on storage.objects for insert
with check (bucket_id = 'catalog-images' and auth.role() = 'authenticated');

create policy "catalog-images: solo admin autenticado puede borrar"
on storage.objects for delete
using (bucket_id = 'catalog-images' and auth.role() = 'authenticated');
