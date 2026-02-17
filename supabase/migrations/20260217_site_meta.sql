-- Adds editable site meta: favicon, name, description, og_image.
-- Run in Supabase SQL Editor.

alter table public.companies
  add column if not exists site_name text,
  add column if not exists site_description text,
  add column if not exists favicon_url text,
  add column if not exists og_image_url text;

comment on column public.companies.site_name is 'Nome/título do site (title, og:title).';
comment on column public.companies.site_description is 'Descrição do site (meta description, og:description).';
comment on column public.companies.favicon_url is 'URL do favicon (link rel=icon).';
comment on column public.companies.og_image_url is 'URL da imagem para redes sociais (og:image, twitter:image). Deve ser absoluta.';
