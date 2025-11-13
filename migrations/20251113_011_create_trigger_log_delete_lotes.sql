-- Migration: Criar trigger após excluir lotes
-- Data: 2025-11-13
-- Descrição: Criação do trigger log_delete_lotes

use chemcom;

DELIMITER //

create trigger log_delete_lotes
before delete on lotes
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Insert", "Lotes", old.id, comcat("Lote de produto com id", old.id_produto, "foi excluído."));
end //

DELIMITER ;