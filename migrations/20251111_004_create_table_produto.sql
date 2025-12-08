-- Migration: Criar tabela produtos
-- Data: 2025-11-11
-- Descrição: Criação da produto

use chemcom;

create table produto(
	id int auto_increment,
    nome varchar(100),
    id_classificacao int,
    preco decimal(10,2),
    descricao varchar(500),
    categoria varchar(25),
	imagem1 varchar(255),
    imagem2 varchar(255),
    imagem3 varchar(255),
    status VARCHAR(20) DEFAULT 'ATIVO',
    
    primary key (id),
    foreign key (id_classificacao) references classificacao_risco(id)
);