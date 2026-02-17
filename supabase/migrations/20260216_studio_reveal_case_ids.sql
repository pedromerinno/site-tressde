-- Studio reveal: 3 cases controlados pelo admin (central, esquerda, direita).
-- Ordem do array: [central_id, esquerda_id, direita_id].
-- Run in Supabase SQL Editor.

alter table public.companies
  add column if not exists studio_reveal_case_ids uuid[] default null;

comment on column public.companies.studio_reveal_case_ids is 'IDs dos cases no reveal do Studio: [central, esquerda, direita]. Null = usa os 3 primeiros publicados.';
