import { createClient } from "@/lib/supabase/server";

// Pensada para usarse DENTRO de cada Server Action sensible, no solo confiando
// en que el proxy bloqueó el acceso a la página que la invoca: una Server
// Action es su propio endpoint (no queda atada a la ruta desde la que se la
// llama), así que necesita revalidar sesión por su cuenta. getUser() (no
// getSession()) porque revalida el token contra Supabase en vez de confiar en
// la cookie tal cual llegó.
export async function requireAdminSession() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
