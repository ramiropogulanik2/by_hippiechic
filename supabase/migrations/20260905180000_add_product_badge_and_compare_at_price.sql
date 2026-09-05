-- Cambio #12 del handoff: badge en las tarjetas + precio anterior tachado.
--
-- compare_at_price guarda el precio de lista ANTERIOR a la oferta. El precio
-- vigente sigue siendo products.price (que es el que va a order_items), así
-- que no hay que tocar nada del carrito ni de los pedidos.
alter table products
  add column compare_at_price numeric(10,2),
  add column badge text;

-- Solo dos badges posibles. Se valida en la base y no solo en el form para
-- que un valor raro no llegue nunca a las tarjetas del catálogo.
alter table products
  add constraint products_badge_check
  check (badge is null or badge in ('nuevo', 'oportunidad'));

-- Un "precio anterior" menor o igual al actual no es una oferta: sería un
-- tachado que muestra un aumento. Se rechaza en la base.
alter table products
  add constraint products_compare_at_price_check
  check (compare_at_price is null or compare_at_price > price);

comment on column products.compare_at_price is 'Precio anterior, tachado en la tarjeta. Null = sin oferta.';
comment on column products.badge is 'nuevo | oportunidad | null. Etiqueta que se dibuja sobre la foto.';
