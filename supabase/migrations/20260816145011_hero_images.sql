create table hero_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table hero_images enable row level security;

create policy "hero_images: lectura publica" on hero_images
  for select using (true);

-- Fotos que ya estaban hardcodeadas en app/(shop)/page.js (7, no 3: la
-- constante HERO_IMAGES creció en fases anteriores sin que el comentario que
-- las describía se actualizara).
insert into hero_images (image_url, display_order) values
  ('/hero-1.jpg', 0),
  ('/hero-2.jpg', 1),
  ('/hero-3.jpg', 2),
  ('/hero-4.jpg', 3),
  ('/hero-5.jpg', 4),
  ('/hero-6.jpg', 5),
  ('/hero-7.jpg', 6);
