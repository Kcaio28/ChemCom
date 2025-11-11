-- Migration: Criar tabela pedidos
-- Data: 2025-11-11
-- Descrição: Criação da tabela pedido

use chemcom;

create table pedido(
	nro_pedido int,
    id_cliente int,
    valor_total decimal(10,2),
    data_pedido datetime,
    status varchar(30),
    
    primary key (nro_pedido),
    foreign key (id_cliente) references empresa(id)
);
    

