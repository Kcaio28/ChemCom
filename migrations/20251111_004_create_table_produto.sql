-- Migration: Criar tabela produtos
-- Data: 2025-11-11
-- Descrição: Criação da produto

use chemcom;

create table produto(
	id int,
    nome varchar(100),
    id_classificacao int,
    preco decimal(10,2),
    descricao varchar(500),
    
    primary key (id),
    foreign key (id_classificacao) references classificacao_risco(id)
    );