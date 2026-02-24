type ClientLogo = {
  name: string;
  src?: string;
  svg?: string;
};

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { getPrimaryCompany } from "@/lib/core/company";
import { OptimizedImage } from "@/components/ui/optimized-image";

const fallbackClients: ClientLogo[] = [
  { name: "Cliente One" },
  { name: "Cliente Two" },
  { name: "Cliente Three" },
  { name: "Cliente Four" },
  { name: "Cliente Five" },
  { name: "Cliente Six" },
  { name: "Cliente Seven" },
  { name: "Cliente Eight" },
];

async function getClientsForMarquee(): Promise<ClientLogo[]> {
  const company = await getPrimaryCompany();

  const { data: cc, error: ccError } = await supabase
    .from("company_clients")
    .select("client_id, sort_order")
    .eq("company_id", company.id)
    .order("sort_order", { ascending: true });

  if (ccError) throw ccError;

  const clientIds = cc?.map((c) => c.client_id) ?? [];
  if (clientIds.length === 0) return [];

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id,name,logo_url,logo_svg")
    .in("id", clientIds);

  if (error) throw error;

  const byId = new Map((clients ?? []).map((c) => [c.id, c]));
  return clientIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((c) => ({
      name: c!.name,
      src: c!.logo_url ?? undefined,
      svg: c!.logo_svg ?? undefined,
    }));
}

const LOGO_COLOR = "hsl(40,5%,60%)";

function LogoItem({ client }: { client: ClientLogo }) {
  return (
    <li className="flex items-center justify-center">
      <div
        className="flex items-center justify-center h-10 md:h-12 px-2"
        style={{ color: LOGO_COLOR }}
      >
        {client.svg ? (
          <span
            className="[&_svg]:h-7 md:[&_svg]:h-8 [&_svg]:w-auto [&_svg]:max-w-[160px] [&_svg_*]:fill-current [&_svg_*]:stroke-current"
            aria-label={client.name}
            dangerouslySetInnerHTML={{ __html: client.svg }}
          />
        ) : client.src ? (
          <OptimizedImage
            src={client.src}
            alt={client.name}
            preset="logo"
            className="h-7 md:h-8 w-auto object-contain"
            style={{
              filter:
                "brightness(0) sepia(0.1) saturate(0.15) hue-rotate(-15deg) brightness(0.8)",
            }}
          />
        ) : (
          <span
            className="font-display text-sm font-medium tracking-wide whitespace-nowrap"
            style={{ color: LOGO_COLOR }}
          >
            {client.name}
          </span>
        )}
      </div>
    </li>
  );
}

export default function ClientLogosMarquee() {
  const { data, isLoading } = useQuery({
    queryKey: ["clients", "marquee"],
    queryFn: getClientsForMarquee,
    staleTime: 5 * 60 * 1000,
  });

  const clients = (
    data && data.length > 0 ? data : Array.isArray(data) ? [] : fallbackClients
  ).slice(0, 14);
  const trackClients = React.useMemo(() => {
    if (clients.length === 0) return [];

    // Repeat enough times so the marquee never “runs out” on wide screens.
    const minItems = 36;
    const repeats = Math.max(4, Math.ceil(minItems / clients.length));
    return Array.from({ length: repeats }, () => clients).flat();
  }, [clients]);

  if (!isLoading && clients.length === 0) return null;

  return (
    <section aria-label="Clientes" className="bg-background overflow-x-hidden">
      <div className="relative w-full px-6 md:px-12 lg:px-20 py-8 md:py-10">
        <h2 className="sr-only">Clientes</h2>

        <div className="relative overflow-hidden rounded-2xl bg-background">
          {/* Edge fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="group relative flex items-center py-6">
            {isLoading && (
              <div className="absolute inset-0 grid place-items-center">
                <span
                  className="font-body text-sm"
                  style={{ color: LOGO_COLOR }}
                >
                  Carregando clientes…
                </span>
              </div>
            )}

            <div className="marquee flex w-max items-center gap-24 md:gap-28 [--marquee-duration:110s] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
              <ul className="flex items-center gap-24 md:gap-28">
                {trackClients.map((client, idx) => (
                  <LogoItem key={`${client.name}-${idx}`} client={client} />
                ))}
              </ul>

              {/* Duplicate for seamless loop */}
              <ul className="flex items-center gap-24 md:gap-28" aria-hidden="true">
                {trackClients.map((client, idx) => (
                  <LogoItem key={`${client.name}-${idx}-dup`} client={client} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

