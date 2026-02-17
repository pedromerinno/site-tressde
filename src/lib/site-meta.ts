import { supabase } from "@/lib/supabase/client";
import { getPrimaryCompany } from "@/lib/onmx/company";

export type SiteMeta = {
  site_name: string | null;
  site_description: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
};

export async function getSiteMeta(): Promise<SiteMeta> {
  const company = await getPrimaryCompany();

  const { data, error } = await supabase
    .from("companies")
    .select("site_name,site_description,favicon_url,og_image_url")
    .eq("id", company.id)
    .single();

  if (error) throw error;

  return {
    site_name: data?.site_name ?? null,
    site_description: data?.site_description ?? null,
    favicon_url: data?.favicon_url ?? null,
    og_image_url: data?.og_image_url ?? null,
  };
}
