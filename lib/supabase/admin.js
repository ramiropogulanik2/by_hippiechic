import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con service_role: BYPASSEA RLS.
//
// Solo puede importarse desde código que corre en el servidor (Server Actions,
// API routes, Server Components). Nunca desde un componente cliente: la key
// terminaría en el bundle del browser y cualquiera podría leer y borrar
// cualquier tabla.
//
// Hace falta acá porque las políticas de orders/order_items solo permiten
// INSERT a anon: sin SELECT no se puede recuperar el id de la orden creada
// (el RETURNING falla), y sin DELETE no se puede hacer el rollback manual.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
