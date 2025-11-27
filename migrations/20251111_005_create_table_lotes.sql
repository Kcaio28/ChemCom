-- Migration: Criar tabela lotes
-- Data: 2025-11-11
-- Descrição: Criação da lotes

use chemcom;

create table lotes (
	id int auto_increment,
    id_produto int,
    data_fab date,
    data_validade date,
    qtd_inicial int,
    qtd_atual int,
    
    primary key (id),
    foreign key (id_produto) references produto(id)
);