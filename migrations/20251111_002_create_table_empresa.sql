-- Migration: Criar tabela empresa
-- Data: 2025-11-11
-- Descrição: Criação da tabela empresa

use chemcom;

create table empresa (
	id int auto_increment,
    CNPJ varchar(18) not null,
    nome varchar(50),
    Telefone varchar(15),
    email varchar(100),
    senha_hash varchar(60),
    CEP varchar(12),
    estado varchar(20),
    cidade varchar(50),
    logradouro varchar(70),
    Nro int,
    cnae_principal VARCHAR(10),
    cnaes_secundarios TEXT,
    autorizacao_status ENUM('APROVADO','PENDENTE','NEGADO') DEFAULT 'PENDENTE',
    status VARCHAR(20) DEFAULT 'ATIVO',
    
    primary key (id)
);