import * as React from "react";
import { Bell, ChevronDown, LogOut, Search, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminTopBarProps = {
  brand?: string;
  onSignOut: () => void | Promise<void>;
};

export default function AdminTopBar({ brand = "TRESSDE®", onSignOut }: AdminTopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f6f5f1] bg-[#fbfbf9]">
      <div className="w-full px-2">
        <div className="h-12 flex items-center justify-between gap-3 py-2">
          {/* Left: company selector */}
          <button
            type="button"
            className={cn(
              "h-8 rounded-full bg-[#f2f0eb] px-2 py-1",
              "flex items-center gap-2",
              "ring-1 ring-black/5",
              "text-sm font-medium text-black",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfbf9]",
            )}
            aria-label="Selecionar empresa"
          >
            <span
              aria-hidden="true"
              className="grid place-items-center h-4 w-4 rounded-[9px] bg-black/10"
            />
            <span className="leading-none">{brand}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
          </button>

          {/* Middle: search */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="w-full max-w-[380px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9b988f]"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Pesquisar"
                  placeholder="Pesquisa..."
                  className={cn(
                    "h-8 rounded-full bg-[#f2f0eb] pl-9 pr-3",
                    "text-xs font-medium text-black placeholder:text-[#9b988f]",
                    "ring-1 ring-black/5 border-0",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                />
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigate("/admin/configuracoes")}
                className={cn(
                  "h-8 w-8 rounded-full bg-[#f2f0eb] grid place-items-center",
                  "ring-1 ring-black/5",
                  "text-black/70 hover:text-black transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfbf9]",
                )}
                aria-label="Configurações"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cn(
                  "h-8 w-8 rounded-full bg-[#f2f0eb] grid place-items-center",
                  "ring-1 ring-black/5",
                  "text-black/70 hover:text-black transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfbf9]",
                )}
                aria-label="Notificações"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="ml-1 flex items-center gap-2 rounded-full bg-[#f2f0eb] pl-1 pr-2 py-1 ring-1 ring-black/5">
              <div
                aria-hidden="true"
                className="h-6 w-6 rounded-full bg-black/10 grid place-items-center text-[10px] font-semibold text-black/70"
              >
                A
              </div>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="ml-1 h-8 w-8 rounded-full hover:bg-[#f2f0eb]"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

