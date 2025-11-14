-- Migration: Alterar tabela produto
-- Data: 2025-11-14
-- Descrição: Alterar table produto

use chemcom;

alter table produto add categoria varchar(25);
