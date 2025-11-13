-- Migration: Criar trigger após excluir produto
-- Data: 2025-11-13
-- Descrição: Criação do trigger log_delete_produto

use chemcom;

DELIMITER //

create trigger log_delete_produto
before delete on produto
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Delete", "Produto", old.id, comcat("Produto com id", old.id, "e nome", old.nome, "foi excluído. "));
end //

DELIMITER ;
