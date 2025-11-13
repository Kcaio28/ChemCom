-- Migration: Criar trigger após criar produto
-- Data: 2025-11-13
-- Descrição: Criação do trigger log_insert_produto

use chemcom;

DELIMITER //

create trigger log_insert_produto
after insert on produto
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Insert", "Produto", NEW.id, comcat("Novo produto", NEW.nome));
end //

DELIMITER ;
