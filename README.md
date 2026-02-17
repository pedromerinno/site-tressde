# TRESSDE® — Site

Landing page TRESSDE® Imagine., construída com Vite + React + TypeScript + Tailwind (shadcn/ui).

## Supabase (MNNO)

Crie um arquivo `.env.local` (não comitar) baseado no `.env.example`:

```sh
cp .env.example .env.local
```

Preencha:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

O client já está configurado em `src/lib/supabase/client.ts`.

## Rodar localmente

```sh
npm i
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Deploy na Vercel

1. **Repositório**  
   O projeto Vercel deve estar ligado a: **https://github.com/pedromerinno/site-tressde**  
   Se ainda estiver em outro repo (ex.: site-onmx), em [Vercel Dashboard](https://vercel.com/dashboard) → projeto → **Settings** → **Git** → altere o repositório para `pedromerinno/site-tressde`, ou crie um **novo projeto** importando esse repo.

2. **Variáveis de ambiente**  
   Em **Settings** → **Environment Variables** defina para Production (e Preview se quiser):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (opcional) `VITE_IMAGEKIT_URL_ENDPOINT`, `VITE_PRIMARY_COMPANY_SLUG`, `VITE_ONMX_WHATSAPP_NUMBER`, `VITE_ONMX_WHATSAPP_TEXT`

3. **Redeploy**  
   Após mudar repo ou env vars: **Deployments** → ⋮ no último deploy → **Redeploy**.
