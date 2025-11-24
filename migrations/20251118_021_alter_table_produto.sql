-- Migration: Alterar tabela produto
-- Data: 2025-11-18
-- Descrição: Alterar table produto

use chemcom;

alter table produto add column imagem1 text;
alter table produto add column imagem2 text;
alter table produto add column imagem3 text;
