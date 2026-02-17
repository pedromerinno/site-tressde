import * as React from "react";
import { motion } from "framer-motion";
import { useContactModal } from "@/contexts/ContactModalContext";

const FinalCTA = () => {
  const contactModal = useContactModal();

  return (
    <section id="contato">
      <div className="px-6 md:px-12 lg:px-20 py-10 md:py-12">
        <div className="mx-auto w-full max-w-screen-2xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-accent/30 ring-1 ring-border/70 shadow-sm">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.10),transparent_45%),radial-gradient(circle_at_80%_0%,hsl(var(--accent)/0.18),transparent_40%)]"
            />

            <div className="relative px-8 md:px-14 lg:px-20 py-20 md:py-28 lg:py-32 min-h-[28rem] md:min-h-[32rem] flex items-center">
              <div className="mx-auto w-full max-w-3xl text-center">
                <motion.h2
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="text-2xl md:text-4xl font-display font-bold tracking-tight leading-[1.05]"
                >
                  Marcas líderes não improvisam.
                  <span className="block">Executam com método.</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-8 md:mt-10 text-base md:text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto"
                >
                  Converse com a TRESSDE e tenha um plano completo para comunicar, lançar
                  e evoluir com consistência.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                  className="mt-12 md:mt-14"
                >
                  {contactModal ? (
                    <button
                      type="button"
                      onClick={contactModal.openContactModal}
                      className="inline-flex h-12 md:h-14 items-center justify-center rounded-2xl bg-primary px-10 font-display text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Falar com a TRESSDE®
                    </button>
                  ) : (
                    <a
                      href="#contato"
                      className="inline-flex h-12 md:h-14 items-center justify-center rounded-2xl bg-primary px-10 font-display text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Falar com a TRESSDE®
                    </a>
                  )}
                </motion.div>

                <p className="mt-7 md:mt-8 text-sm text-foreground/55">
                  Resposta em até 1 dia útil. Sem spam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
