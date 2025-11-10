-- Migration: Criar tabela clientes
-- Data: 2025-11-10
-- Descrição: Tabela para armazenar clientes do sistema

use chemCom;


create table Cliente (
	CNPJ char(14) not null unique,
    senha varchar(50),
    data_criacao date,
    nome varchar(50) not null,
    telefone varchar(11),
    nivelAutorizacao int default 1,
    CEP char(8),
    estado char(2),
    cidade varchar(50),
    logradouro varchar(100),
    Nro int,
    
    primary key (CNPJ)
);

