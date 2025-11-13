-- Migration: Criar tabela log
-- Data: 2025-11-13
-- Descrição: Criação da tabela log

use chemcom;

create table log (
	id int auto_increment,
    data_hora datetime default current_timestamp,
    usuario varchar(100),
    acao varchar(50),
    tabela_afetada varchar(100),
    id_registro_afetado int,
    descricao text,
    primary key (id)
);
