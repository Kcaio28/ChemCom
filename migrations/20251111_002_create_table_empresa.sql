-- Migration: Criar tabela empresa
-- Data: 2025-11-11
-- Descrição: Criação da tabela empresa

use chemcom;

create table empresa (
	id int unique,
    CNPJ char(13) not null,
    nome varchar(50),
    Telefone varchar(11),
    email varchar(100),
    senha_hash varchar(50),
    CEP char(8),
    estado char(2),
    cidade varchar(50),
    logradouro varchar(50),
    Nro int,
    
    primary key (id)
);
	