-- Migration: Criar trigger após alterar produto
-- Data: 2025-11-13
-- Descrição: Criação do trigger log_update_produto

use chemcom;

DELIMITER //

create trigger log_update_produto
before delete on produto
for each row
begin
	insert into log (acao, tabela_afetada, id_registro_afetado, descricao)
    values ("Update", "Produto", old.id, comcat("Produto com id", old.id, "e nome", old.nome, "foi alterada sua descrição ou preço foram alterados:", old.preco, "e", old.descricao));
end //

DELIMITER ;
