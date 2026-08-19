"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink placeholder:text-ink/60 focus:border-caramel focus:outline-none";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Mensaje genérico a propósito: no conviene revelar si el mail existe.
      setErrorMessage("Email o contraseña incorrectos");
      setIsSubmitting(false);
      return;
    }

    router.push("/admin");
    // Sin refresh el proxy sigue viendo la request vieja, sin sesión.
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-sand px-4">
      <div className="w-full max-w-sm rounded-sm border border-ink/10 bg-card p-8">
        <h1 className="font-accent text-3xl tracking-wide">HIPPIE &amp; CHIC</h1>
        <p className="mb-8 mt-1 font-body text-sm text-ink/70">
          Panel de administración
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 w-full rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-sand transition-opacity ${
              isSubmitting ? "cursor-not-allowed opacity-60" : "hover:opacity-90"
            }`}
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 text-sm text-rose">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
