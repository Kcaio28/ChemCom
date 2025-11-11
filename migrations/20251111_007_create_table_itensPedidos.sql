-- Migration: Criar tabela que lista os produtos do pedido
-- Data: 2025-11-11
-- Descrição: Criação da itensPedidos

use chemcom;

create table itensPedidos(
	id_produto int,
    nro_pedido int,
    id_lote int,
    qtd int,
    preco_unitario decimal(10,2),
    
    primary key (id_produto),
    
    foreign key (id_produto) references produto(id),
    foreign key (nro_pedido) references pedido(nro_pedido),
    foreign key (id_lote) references lotes(id)
);


