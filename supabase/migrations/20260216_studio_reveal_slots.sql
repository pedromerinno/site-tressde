-- Studio reveal: cada slot pode ser um case OU mídia da biblioteca (imagem/vídeo).
-- Formato: array de 3 itens. Cada item: { "type": "case", "case_id": "uuid" } ou
-- { "type": "media", "media_type": "image"|"video", "url": "...", "mux_playback_id": "...", "poster_url": "..." }.
-- Se studio_reveal_slots for null, o app usa studio_reveal_case_ids (comportamento antigo).

alter table public.companies
  add column if not exists studio_reveal_slots jsonb default null;

comment on column public.companies.studio_reveal_slots is 'Config dos 3 slots do Studio reveal: case ou mídia da biblioteca. Null = usar studio_reveal_case_ids.';
