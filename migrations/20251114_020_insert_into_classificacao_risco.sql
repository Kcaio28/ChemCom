-- Migration: Adicionar niveis de periculosidade
-- Data: 2025-11-14
-- Descrição: Adicionar nivel de periculosidade

insert into classificacao_risco values (1, "Baixa periculosidade", "Produto químico que apresenta riscos reduzidos durante o uso normal. Pode causar efeitos leves e facilmente reversíveis em caso de exposição, desde que sejam adotados cuidados básicos de manuseio. Não requer medidas especiais além dos procedimentos de segurança padrão.");
insert into classificacao_risco values (2, "Média periculosidade", "Produto químico que pode provocar efeitos moderados à saúde, ao ambiente ou à operação se utilizado de forma inadequada. Exige atenção no manuseio, armazenamento e descarte, bem como o uso de práticas de segurança mais rigorosas para evitar acidentes ou exposições desnecessárias.");
insert into classificacao_risco values (3, "Alta periculosidade", "Produto químico com potencial significativo de causar danos graves em caso de exposição, manuseio incorreto ou falhas operacionais. Requer controles específicos, equipamentos de proteção adequados e protocolos de segurança robustos para garantir o uso seguro e prevenir incidentes.");
