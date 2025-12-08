create database chemCom;

use chemcom;
create table empresa (
	id int auto_increment,
    CNPJ char(13) not null,
    nome varchar(50),
    Telefone varchar(11),
    email varchar(100),
    senha_hash char(60),
    CEP char(8),
    estado char(2),
    cidade varchar(50),
    logradouro varchar(50),
    Nro int,
    
    primary key (id)
);
create table classificacao_risco (
	id int,
	nome varchar(100),
	descricao varchar(500),

	primary key(id)
);
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
    
    primary key (id),
    foreign key (id_classificacao) references classificacao_risco(id)
    );
create table lotes (
	id int auto_increment,
    id_produto int,
    data_fab date,
    data_validade date,
    qtd_inicial int,
    qtd_atual int,
    
    primary key (id),
    foreign key (id_produto) references produto(id)
);
create table pedido(
	nro_pedido int auto_increment,
    id_cliente int,
    valor_total decimal(10,2),
    data_pedido datetime,
    status varchar(30),
    
    primary key (nro_pedido),
    foreign key (id_cliente) references empresa(id)
);
    
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
DELIMITER //

create trigger log_insert_lotes
after insert on lotes
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Insert", "Lotes", NEW.id, concat("Novo lote deproduto com id", NEW.id_produto));
end //

DELIMITER ;
DELIMITER //

create trigger log_delete_lotes
before delete on lotes
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Insert", "Lotes", old.id, concat("Lote de produto com id", old.id_produto, "foi excluído."));
end //

DELIMITER ;
DELIMITER //

create trigger log_insert_produto
after insert on produto
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Insert", "Produto", NEW.id, concat("Novo produto", NEW.nome));
end //

DELIMITER ;
DELIMITER //

create trigger log_delete_produto
before delete on produto
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Delete", "Produto", old.id, concat("Produto com id", old.id, "e nome", old.nome, "foi excluído. "));
end //

DELIMITER ;
DELIMITER //

create trigger log_update_produto
before update on produto
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Update", "Produto", old.id, concat("Produto com id", old.id, "e nome", old.nome, "foi alterada sua descrição ou preço foram alterados:", old.preco, "e", old.descricao));
end //

DELIMITER ;
create table useradm (
	id int auto_increment,
    nome varchar(50),
    telefone char(11),
    email varchar(100),
    senha_hash char(60),
    
    primary key (id)
);
insert into useradm (nome, telefone, email, senha_hash) values ("User ADM", "11912345678", "chemcom@gmail.com", "$2a$10$nGrhxxaIJeMcjs/QLI8zO.4hKcFRzftaEB9Xrc2bYrWzfqxwAkJU2");

insert into classificacao_risco values (1, "Baixa periculosidade", "Produto químico que apresenta riscos reduzidos durante o uso normal. Pode causar efeitos leves e facilmente reversíveis em caso de exposição, desde que sejam adotados cuidados básicos de manuseio. Não requer medidas especiais além dos procedimentos de segurança padrão.");
insert into classificacao_risco values (2, "Média periculosidade", "Produto químico que pode provocar efeitos moderados à saúde, ao ambiente ou à operação se utilizado de forma inadequada. Exige atenção no manuseio, armazenamento e descarte, bem como o uso de práticas de segurança mais rigorosas para evitar acidentes ou exposições desnecessárias.");
insert into classificacao_risco values (3, "Alta periculosidade", "Produto químico com potencial significativo de causar danos graves em caso de exposição, manuseio incorreto ou falhas operacionais. Requer controles específicos, equipamentos de proteção adequados e protocolos de segurança robustos para garantir o uso seguro e prevenir incidentes.");


select * from empresa;
select * from produto;
select * from lotes;
select * from itensPedidos;
select * from pedido;

use chemcom;

SET SQL_SAFE_UPDATES = 0;
DELETE FROM itenspedidos;
DELETE FROM pedido;
DELETE FROM empresa;
SET SQL_SAFE_UPDATES = 1;

ALTER TABLE empresa
ADD COLUMN cnae_principal VARCHAR(10),
ADD COLUMN cnaes_secundarios TEXT,
ADD COLUMN autorizacao_status ENUM('APROVADO','PENDENTE','NEGADO') DEFAULT 'PENDENTE';
ALTER TABLE empresa ADD COLUMN status VARCHAR(20) DEFAULT 'ATIVO';
ALTER TABLE produto ADD COLUMN status VARCHAR(20) DEFAULT 'ATIVO';
ALTER TABLE empresa MODIFY Telefone VARCHAR(15);
ALTER TABLE empresa MODIFY CNPJ CHAR(18);