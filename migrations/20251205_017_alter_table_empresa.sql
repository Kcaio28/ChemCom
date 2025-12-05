-- Data: 2025-12-05

ALTER TABLE empresa
ADD COLUMN cnae_principal VARCHAR(10),
ADD COLUMN cnaes_secundarios TEXT,
ADD COLUMN autorizacao_status ENUM('APROVADO','PENDENTE','NEGADO') DEFAULT 'PENDENTE';