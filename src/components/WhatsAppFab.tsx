import { MessageCircle } from "lucide-react";

function getWhatsAppHref() {
  const number = (import.meta.env.VITE_ONMX_WHATSAPP_NUMBER || "").trim();
  const text = (import.meta.env.VITE_ONMX_WHATSAPP_TEXT || "").trim();

  // If the number isn't configured yet, fall back to the contact section.
  if (!number) return "#contato";

  const base = `https://wa.me/${number}`;
  if (!text) return base;

  return `${base}?text=${encodeURIComponent(text)}`;
}

const WhatsAppFab = () => {
  const href = getWhatsAppHref();
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      aria-label="Abrir WhatsApp"
      title="WhatsApp"
      className={[
        "fixed z-50 right-5 bottom-5 md:right-7 md:bottom-7",
        "h-11 w-11 md:h-12 md:w-12",
        "rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg shadow-black/10",
        "ring-1 ring-black/10",
        "grid place-items-center",
        "transition-transform duration-200 will-change-transform",
        "hover:scale-[1.04] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      ].join(" ")}
    >
      <MessageCircle className="h-5 w-5 md:h-5 md:w-5" aria-hidden="true" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
};

export default WhatsAppFab;

