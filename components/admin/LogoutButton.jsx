"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/admin/login");
    // Sin refresh el proxy sigue viendo las cookies de la sesión anterior.
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSigningOut}
      className="rounded-full border border-sand/30 px-4 py-1.5 font-body text-sm text-sand transition-colors hover:bg-sand/10 disabled:opacity-60"
    >
      {isSigningOut ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
