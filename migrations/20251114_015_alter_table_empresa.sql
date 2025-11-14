-- Migration: Alterando tabela empresa
-- Data: 2025-11-14
-- Descrição: Alterar tabela empresa

use chemcom;

alter table empresa modify id int auto_increment;
alter table empresa modify senha_hash char(60);