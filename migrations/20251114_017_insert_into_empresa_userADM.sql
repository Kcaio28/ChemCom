-- Migration: Adicionar usuário ADM
-- Data: 2025-11-14
-- Descrição: Adicionar user Adm
use chemcom;
insert into useradm (nome, telefone, email, senha_hash) values ("User ADM", "11912345678", "chemcom@gmail.com", "7c4a8d09ca3762af61e59520943dc26494f8941b");
