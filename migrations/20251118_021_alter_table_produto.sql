-- Migration: Alterar tabela produto
-- Data: 2025-11-18
-- Descrição: Alterar table produto

use chemcom;

alter table produto add column imagem1 varchar(255);
alter table produto add column imagem2 varchar(255);
alter table produto add column imagem3 varchar(255);
