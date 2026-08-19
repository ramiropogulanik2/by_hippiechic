"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const ORDER_OPTIONS = [
  { value: "recientes", label: "Recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

const SEARCH_DEBOUNCE_MS = 350;

export default function CategoryFilters({ availableSizes = [], currentSlug }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedSizes = (searchParams.get("talle") ?? "")
    .split(",")
    .filter(Boolean);
  const currentOrder = searchParams.get("orden") ?? "recientes";

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("buscar") ?? ""
  );

  // Evita que el efecto de sincronización de abajo pise lo que la persona
  // está tipeando cuando el cambio de URL lo disparó este mismo componente
  // (el push del debounce). Solo se resetea el input desde afuera —
  // botón atrás/adelante del navegador, o "Limpiar filtros".
  const isOwnUpdate = useRef(false);

  useEffect(() => {
    if (isOwnUpdate.current) {
      isOwnUpdate.current = false;
      return;
    }

    setSearchInput(searchParams.get("buscar") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Debounce: cada letra tipeada reinicia el timer, recién a los 350ms sin
  // tipear se actualiza la URL. replace (no push) a propósito, si no cada
  // letra dejaría una entrada en el historial y "atrás" no volvería a la
  // categoría sino letra por letra de la búsqueda.
  useEffect(() => {
    const currentInUrl = searchParams.get("buscar") ?? "";
    if (searchInput === currentInUrl) return;

    const timer = setTimeout(() => {
      isOwnUpdate.current = true;
      router.replace(buildUrl({ buscar: searchInput || null }), {
        scroll: false,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function buildUrl(updates) {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    const queryString = next.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  function handleOrderChange(event) {
    const value = event.target.value;
    // push, no replace: elegir un orden es una decisión concreta, tiene
    // sentido que "atrás" la deshaga (a diferencia de tipear en el buscador).
    router.push(buildUrl({ orden: value === "recientes" ? null : value }), {
      scroll: false,
    });
  }

  function toggleSize(size) {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((current) => current !== size)
      : [...selectedSizes, size];

    router.push(
      buildUrl({ talle: next.length > 0 ? next.join(",") : null }),
      { scroll: false }
    );
  }

  function clearFilters() {
    setSearchInput("");
    router.push(`/categoria/${currentSlug}`, { scroll: false });
  }

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    searchInput.length > 0 ||
    currentOrder !== "recientes";

  return (
    <div className="mb-10 flex flex-col gap-4 border-b border-ink/10 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar en esta categoría..."
            aria-label="Buscar productos"
            className="w-full rounded-sm border border-ink/20 bg-card py-2.5 pl-10 pr-4 font-body text-sm text-ink placeholder:text-ink/60 focus:border-caramel focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 sm:w-auto">
          <span className="sr-only">Ordenar por</span>
          <select
            value={currentOrder}
            onChange={handleOrderChange}
            className="w-full rounded-sm border border-ink/20 bg-card px-3 py-2.5 font-body text-sm text-ink focus:border-caramel focus:outline-none sm:w-auto"
          >
            {ORDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {availableSizes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70">
            Talle
          </span>
          {availableSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);

            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                aria-pressed={isSelected}
                className={`flex min-w-11 items-center justify-center rounded-full border px-4 py-1.5 font-body text-sm transition-all duration-300 ${
                  isSelected
                    ? "border-ink bg-ink text-sand"
                    : "border-ink/20 text-ink hover:border-ink hover:bg-ink/5"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="link-underline self-start font-body text-xs uppercase tracking-[0.14em] text-ink/70 transition-colors hover:text-caramel"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
