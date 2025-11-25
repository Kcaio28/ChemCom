-- Migration: Adicionar usuário ADM
-- Data: 2025-11-14
-- Descrição: Adicionar user Adm
use chemcom;
insert into useradm (nome, telefone, email, senha_hash) values ("User ADM", "11912345678", "chemcom@gmail.com", "$2a$10$nGrhxxaIJeMcjs/QLI8zO.4hKcFRzftaEB9Xrc2bYrWzfqxwAkJU2");
