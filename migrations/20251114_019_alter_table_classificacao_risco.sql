-- Migration: Alterar tabela classificação de risco
-- Data: 2025-11-14
-- Descrição: Alterar table classificacao_risco

use chemcom;

alter table classificacao_risco drop column nivel_periculosidade;