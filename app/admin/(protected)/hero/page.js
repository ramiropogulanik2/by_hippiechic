import Image from "next/image";
import { ImageIcon } from "lucide-react";
import HeroRowActions from "@/components/admin/HeroRowActions";
import HeroUploadForm from "@/components/admin/HeroUploadForm";
import { createAdminClient } from "@/lib/supabase/admin";

// El cliente admin no toca cookies, así que sin esto Next prerenderiza la
// página en build time y el listado quedaría congelado.
export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const supabase = createAdminClient();

  const { data: images, error } = await supabase
    .from("hero_images")
    .select("id, image_url, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error cargando fotos de hero:", error.message);
  }

  const imageList = images ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold">Hero</h1>
        <p className="font-body text-sm text-ink/60">
          Fotos que rotan en el carrusel de la portada, en este orden.
        </p>
      </div>

      {imageList.length === 0 ? (
        <p className="py-16 text-center font-accent text-2xl text-ink/60">
          Todavía no hay fotos. Subí la primera.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {imageList.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-wrap items-center gap-4 rounded-sm border border-ink/10 bg-card p-4"
            >
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-sand">
                {image.image_url ? (
                  <Image
                    src={image.image_url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-ink/30" strokeWidth={1.5} />
                )}
              </div>

              <span className="flex-1 font-body text-sm text-ink/50">
                Posición {index + 1}
              </span>

              <HeroRowActions
                image={image}
                isFirst={index === 0}
                isLast={index === imageList.length - 1}
              />
            </li>
          ))}
        </ul>
      )}

      <HeroUploadForm />
    </div>
  );
}
