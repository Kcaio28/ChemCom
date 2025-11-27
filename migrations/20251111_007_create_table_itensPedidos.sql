-- Migration: Criar tabela que lista os produtos do pedido
-- Data: 2025-11-11
-- Descrição: Criação da itensPedidos

use chemcom;

create table itensPedidos(
	id_item int auto_increment,
    nro_pedido int,
    id_produto int,
    id_lote int,
    qtd int,
    preco_unitario decimal(10,2),
    
    primary key (id_item),
    
    foreign key (nro_pedido) references pedido(nro_pedido),
    foreign key (id_produto) references produto(id),
    foreign key (id_lote) references lotes(id)
);