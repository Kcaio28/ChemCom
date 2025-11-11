-- Migration: Criar tabela produtos
-- Data: 2025-11-11
-- Descrição: Criação da produto

use chemcom;

create table lotes (
	id int,
    id_produto int,
    codigo_lote varchar(50),
    data_fab date,
    data_validade date,
    qtd_inicial int,
    qtd_atual int,
    
    primary key (id),
    foreign key (id_produto) references produto(id)
);
