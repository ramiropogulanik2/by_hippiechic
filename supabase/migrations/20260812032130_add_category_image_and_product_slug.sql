alter table categories add column image_url text;

create extension if not exists unaccent;

alter table products add column slug text;

update products
set slug = trim(both '-' from regexp_replace(lower(unaccent(name)), '[^a-z0-9]+', '-', 'g'));

alter table products add constraint products_slug_unique unique (slug);
alter table products alter column slug set not null;
