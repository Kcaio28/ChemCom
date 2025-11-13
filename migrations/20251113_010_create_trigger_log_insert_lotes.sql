-- Migration: Criar tabela log
-- Data: 2025-11-13
-- Descrição: Criação do trigger log_insert_produtos

use chemcom;

DELIMITER //

create trigger log_insert_lotes
after insert on lotes
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Insert", "Lotes", NEW.id, comcat("Novo lote deproduto com id", NEW.id_produto));
end //

DELIMITER ;