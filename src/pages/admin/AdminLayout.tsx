import * as React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase/client";
import { isCurrentUserAdmin } from "@/lib/supabase/admin";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const admin = await isCurrentUserAdmin();
      if (!admin) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setReady(true);
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#fbfbf9] text-black grid place-items-center px-6">
        <p className="text-sm text-black/50">Carregando…</p>
      </main>
    );
  }

  const isCaseFullscreenRoute = /^\/admin\/cases\/[^/]+\/(builder|editar|preview)\/?$/.test(
    location.pathname,
  );

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-black">
      {!isCaseFullscreenRoute && <AdminTopBar onSignOut={signOut} />}

      {isCaseFullscreenRoute ? (
        <Outlet />
      ) : (
        <div className="w-full px-2">
          <div className="flex gap-2">
            <AdminSidebar />

            <div className="min-w-0 flex-1 pt-2">
              <main className="px-6 md:px-10 lg:px-12 py-10">
                <div className="mx-auto w-full max-w-6xl">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

