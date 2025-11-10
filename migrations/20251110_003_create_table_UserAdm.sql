-- Migration: Criar tabela UserAdm
-- Data: 2025-11-10
-- Descrição: Tabela para armazenar Adms do sistema

use chemCom;

create table UserAdm(
	CPF char(11) not null unique,
    id int not null,
    nome varchar(100),
    telefone char(11),
    email varchar(100),
    senha varchar(50),
    
    primary key (id)
);

