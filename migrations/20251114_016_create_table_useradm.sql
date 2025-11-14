-- Migration: Criar tabela pra usuários ADM 
-- Data: 2025-11-14
-- Descrição: Criar tabela user Adm

use chemcom;

create table useradm (
	id int auto_increment,
    nome varchar(50),
    telefone char(11),
    email varchar(100),
    senha_hash char(60),
    
    primary key (id)
);