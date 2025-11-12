-- Migration: Criar tabela item
-- Data: 2025-11-12
-- Descrição: Criação da tabela item

use chemcom;

create table item(
	id int,
    id_produto int,
    id_lote int,
    qtd int,
    
    primary key (id),
    
    foreign key (id_produto) references produto(id),
    foreign key (id_lote) references lotes(id)
);

drop table item;
