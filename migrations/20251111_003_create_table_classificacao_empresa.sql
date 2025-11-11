-- Migration: Criar tabela classificação de risco
-- Data: 2025-11-11
-- Descrição: Criação da classificacao_risco

use empresa;

create table classificacao_risco (
	id int,
	nome varchar(100),
	descricao varchar(500),
    nivel_periculosidade varchar(50),
	primary key(id)
);