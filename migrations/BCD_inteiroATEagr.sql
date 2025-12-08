create database chemCom;

use chemcom;

create table empresa (
	id int auto_increment,
    CNPJ varchar(18) not null,
    nome varchar(50),
    Telefone varchar(15),
    email varchar(100),
    senha_hash varchar(60),
    CEP varchar(12),
    estado varchar(20),
    cidade varchar(50),
    logradouro varchar(70),
    Nro int,
    cnae_principal VARCHAR(10),
    cnaes_secundarios TEXT,
    autorizacao_status ENUM('APROVADO','PENDENTE','NEGADO') DEFAULT 'PENDENTE',
    status VARCHAR(20) DEFAULT 'ATIVO',
    
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
    status VARCHAR(20) DEFAULT 'ATIVO',
    
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

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Ácido cítrico anidro 25kg", 1, 160.00, "Fórmula: C₆H₈O₇ — sólido cristalino. Aplicações: acidulante alimentício, limpeza industrial leve, tamponamento em formulações cosméticas e farmacêuticas. Risco principal: irritação ocular e respiratória em pó. Medida de segurança crítica: uso de máscara P2 e óculos de proteção ao manusear em pó.", "Ácido", "1764870101404-Citric_Acid_Anhydrous_Bag_Product.png", "1764870101472-ChemCom_Citric_Warehouse_Precision.png", "1764870101570-Sterile_Powder_Dosing_Technician.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Ácido acético glacial (99– glacial, técnico) 200L", 2, 6240.00, "Fórmula: CH₃COOH — líquido incolor, corrosivo e volátil. Aplicações: síntese orgânica, solvente, produção de acetatos e tintas, indústrias químicas. Risco principal: corrosão de pele, vapores irritantes e inflamabilidade em concentrações altas. Medida de segurança crítica: ventilação localizada e luvas resistentes a químicos (neoprene/VC).", "Ácido", "1764870568319-Industrial_Acetic_Acid_Drum_Photo.png", "1764870568373-Chemical_Storage_Facility_Safety_Wide.png", "1764871160528-Sodium_Bicarbonate_Bag_Product_Shot.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Ácido sulfúrico concentrado (98%) 200L", 3, 1050.00, "Fórmula: H₂SO₄ — líquido denso, altamente corrosivo. Aplicações: produção de fertilizantes, refinarias, tratamentos de superfície, baterias industriais. Risco principal: queimaduras químicas severas e reações exotérmicas com água/organics. Medida de segurança crítica: manuseio em área com capela/dispensa com EPI completo (avental resistente, proteção facial) e procedimentos de diluição controlada.", "Ácido", "1764783887744-Sulfuric_Acid_Drum_Label_Macro.png", "1764783887790-Industrial_Acid_Drum_Studio_Shot.png", "1764783887839-Chemical_Storage_Safety_Compliance.png");

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Bicarbonato de sódio (NaHCO₃) 25KG", 1, 120.00, "Fórmula: NaHCO₃ — pó/ sólido branco. Aplicações: neutralização de ácidos, indústria alimentícia, tratamento de efluentes, produtos de limpeza. Risco principal: irritação respiratória por poeira. Medida de segurança crítica: controle de poeira e máscara P2 ao empacotar.", "Base", "1764871160528-Sodium_Bicarbonate_Bag_Product_Shot.png", "1764871160595-Food_Grade_Powder_Warehouse_Interior.png", "1764871160666-Food_QC_Powder_Transfer.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Hidróxido de cálcio (Cal hidratada, Ca(OH)₂ — pó/granular) 25kg", 2, 45.00, "Formula: Ca(OH)₂ (sólido pó). Aplicações: correção de pH solo, tratamento de efluentes, construção (argamassas), agente neutralizante. Risco principal: irritante respiratório e ocular; contato úmido pode causar irritação e dermatitis. Medida crítica: controle de poeira e máscara P2/P3 em manipulação a seco.", "Base", "1764702101602-Calcium_Hydroxide_Bag_Product_Shot.png", "1764702101695-Chemcom_Calcium_Hydroxide_Warehouse.png", "1764702101767-Calcium_Hydroxide_Safe_Handling.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Hidróxido de sódio (soda cáustica) — pastilhas ou flocos 25kg", 3, 290.00, "Fórmula: NaOH — sólido (flocos/pastilhas) ou solução muito cáustica. Aplicações: fabricação de detergentes, processamento de óleo, decapagem, controle de pH industrial. Risco principal: queimaduras severas por contato com pele/olhos e reatividade com metais/água. Medida de segurança crítica: EPI completo (luvas químicas de alto desempenho, avental, proteção facial) e capela/área controlada para dissolução.", "Base", "1764873547027-Caustic_Soda_Bag_Product_Shot.png", "1764873547115-Corrosive_Solid_Warehouse_Interior.png", "1764873547239-Chemical_Dissolution_Safety_Procedure.png");

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Cloreto de sódio (NaCl) — grau técnico 50kg", 1, 70.00, "Fórmula: NaCl — sólido cristalino. Aplicações: indústria alimentícia, desidratação, produção química base, tratamento de água. Risco principal: risco baixo; irritação por poeira em manuseio. Medida de segurança crítica: controle de poeira e EPI básico (óculos, luvas).", "Sal", "1764703375547-Industrial_Salt_Bag_Portuguese_Studio.png", "1764703375645-Salt_Bags_Warehouse_Stack.png", "1764703375735-Industrial_Salt_Dosing_Facility.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Sulfato de cobre pentahidratado (CuSO₄·5H₂O) 25kg", 2, 220.00, "Fórmula: CuSO₄·5H₂O (sólido cristalino azul). Aplicações: fungicida em agricultura, agente de testes eletroquímicos, curtumes, formulações de compostos inorgânicos. Risco principal: tóxico para organismos aquáticos; ingestão ou exposição cutânea prolongada pode ser tóxica. Medida de segurança crítica: uso de luvas resistentes, evitar descarga em corpos d'água e armazenamento seguro.", "Sal", "1764876023987-Copper_Sulfate_Bag_Studio_Shot.png", "1764876024062-Industrial_Copper_Sulfate_Storage.png", "1764876024177-Chemical_Handling_Safety.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Cianeto de sódio (NaCN) técnico (uso industrial controlado) 25kg", 3, 4500.00, "Fórmula: NaCN (sólido cristalino). Aplicações: mineração (lixiviação de ouro), síntese orgânica. Risco principal: altíssima toxicidade por ingestão/inalação; libera HCN em contato com ácidos. Medida de segurança crítica: manuseio em áreas controladas com EPI completo, procedimentos de emergência e neutralização; uso restrito e licença conforme legislação.", "Sal", "1764876916911-Industrial_NaCN_Bag_Studio_Shot.png", "1764876916930-Cyanide_Transfer_PPE_Facility.png", "1764876916968-Chemical_Safety_Cabinet_Wide_Shot.png");

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Óleo vegetal refinado (solvente/veículo em formulações) 200L", 1, 1200.00, "Fórmula: mistura de triglicerídeos (líquido viscoso). Aplicações: extração oleosa comestível, excipiente em cosméticos/saquetas, solvente para formulações alimentícias. Risco principal: risco baixo; perigo maior é rancidez/contaminação microbiológica. Medida de segurança crítica: armazenar em local fresco, evitar contaminação e rotular corretamente.", "Solvente", "1764877420337-Refined_Oil_Drum_Product_Shot.png", "1764877420400-Food_Warehouse_Oil_Drums_Pristine.png", "1764877420479-Kitchen_Oil_Transfer_Safety.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Acetona (propanona, (CH₃)₂CO, líquido) 5L", 2, 75.00, "Fórmula: (CH₃)₂CO (líquido volátil). Aplicações: limpeza e desengraxantes, resinas e polímeros, extração, indústria farmacêutica e lacas. Risco principal: altamente inflamável, vapores podem formar mistura explosiva; irritante. Medida crítica: armazenamento em área ventilada, proteções antiestáticas e afastar fontes de ignição.", "Solvente", "1764704223612-Acetone_Gallon_Studio_Product_Shot.png", "1764704223672-Acetone_Gallon_Label_Macro_Shot.png", "1764704223747-Lab_Safety_Flammable_Storage_Wide_Angle.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Hexano técnico (n-hexano) 200L", 3, 500.00 , "Fórmula: C₆H₁₄ (líquido volátil, inflamável, neurotóxico). Aplicações: extração de óleos vegetais, solvente industrial em adesivos e limpeza de peças. Risco principal: neurotoxicidade por exposição crônica; inflamável e risco de vapor explosivo. Medida de segurança crítica: manuseio em áreas com ventilação forçada, monitoramento de exposição e EPI respiratório quando necessário; controle estrito de fontes de ignição.", "Solvente", "1764878030079-Red_Hexane_Drum_Studio_Shot.png", "1764878030163-Industrial_Flammable_Storage_Facility.png", "1764878030228-Hexane_Transfer_Safety_Operation.png");

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Polietileno de baixa densidade (LDPE, pellets) 25kg", 1, 350.00, "Formula: (C₂H₄)n (sólido granulado). Aplicações: filmes, sacarias, embalagens flexíveis, extrusão e moldagem por sopro. Risco principal: risco físico (pó em enchimento — incêndio de poeira raro) e problemas na reciclagem; não tóxico. Medida crítica: controle de poeira e prevenção de acúmulo estático durante transporte.", "Polímero", "1764704868357-LDPE_Pellets_Macro_Studio.png", "1764704868418-Pellet_Feed_Injection_Molding.png", "1764704870235-Warehouse_LDPE_Granules_Bags_CHEMCOM.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("PVC resina (policloreto de vinila) grau rígido 25kg", 2, 320.00, "Fórmula: (C₂H₃Cl)n (sólido, pó/granulado). Aplicações: perfis rígidos, tubos, calhas; compósitos com plastificantes. Risco principal: inalação de pó e potencial liberação de HCl em processamento térmico; alguns aditivos podem ser tóxicos. Medida de segurança crítica: controle de poeira, ventilação na extrusão e EPI para partículas; evitar superaquecimento.", "Polímero", "1764878372206-PVC_Resin_Bag_Product_Shot.png", "1764878372276-Modern_Resin_Warehouse_Interior.png", "1764878372361-PVC_Resin_Dust_Control.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("MDI (diphenilmetano diisocianato) — precursor poliuretano 200L", 3, 18000.00, "Fórmula: mixture ≈ MDI (líquido/viscose). Aplicações: matéria-prima para espumas rígidas/flexíveis e revestimentos. Risco principal: sensibilizante respiratório muito forte; exposição pode causar asma ocupacional e reações alérgicas. Medida de segurança crítica: manuseio em área com capela/ventilação e EPI respiratório apropriado (SCBA ou máscaras com cartucho) e treinamentos para evitar exposição.", "Polímero", "1764878789499-MDI_Drum_Safety_Shot.png", "1764878789559-Industrial_Warehouse_MDI_Storage.png", "1764878789635-MDI_Transfer_Isocyanate_Safety.png");

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("NPK granulados 10-20-10 (fertilizante) 50kg", 1, 95.00, "Fórmula: mistura de N-P-K (sólido granulado). Aplicações: fertilização de culturas, adubação basal e de cobertura. Risco principal: risco de irritação por poeira; manuseio incorreto pode causar desequilíbrio de nutrientes no solo. Medida de segurança crítica: proteção contra poeira durante aplicação (máscara tipo P1/P2) e armazenamento seco.", "Agricultura", "1764879189739-NPK_Fertilizer_Bag_CHEMCOM_Spill.png", "1764879189797-Fertilizer_Storage_Barn_Wide_Angle.png", "1764879189874-Farmer_Fertilizing_Corn_Golden_Hour.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Glifosato (sulfato ou sal isopropilamina, técnico) 20L", 2, 300.00, "Formula (exemplo sal IPA): C₃H₈NO₅P (sólido/pastoso quando formulado). Aplicações: herbicida sistêmico para manejo de plantas daninhas na agricultura. Risco principal: controvérsias toxicológicas e risco ambiental; irritante; formular com surfactantes aumenta riscos. Medida crítica: EPI impermeável + luvas químicas e evitar deriva por pulverização (ventos baixos, bicos adequados).", "Agricultura", "1764705803790-Glyphosate_Label_Macro_Sharp.png", "1764705803870-Agrochem_Depot_Safety_Exemplar.png", "1764705803939-Precision_Glyphosate_Application_PPE.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Clorpirifós (inseticida organofosforado) — (uso restrito/controlado) 20L", 3, 1380.00, "Fórmula: C₉H₁₁Cl₃NO₃PS (líquido/solução técnica). Aplicações: controle de insetos em culturas específicas (uso sujeito à regulamentação). Risco principal: neurotoxicidade (inibição da colinesterase) por contato ou ingestão; efeito agudo severo. Medida de segurança crítica: manuseio restrito com EPI completo (luvas químicas, proteção respiratória), monitoramento de sinais de intoxicação e observância rigorosa de legislação e limites de uso.", "Agricultura", "1764902880260-Pesticide_Container_Hazard_Shot.png", "1764902880698-Chemical_Storage_Security_Facility.png", "1764902881808-Chlorpyrifos_Safety_Operator_Demonstration.png");

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Paracetamol (acetaminofeno) — ingrediente ativo (C₈H₉NO₂, pó) 25kg", 1, 2600.00, "Fórmula: C₈H₉NO₂ (sólido cristalino). Aplicações: princípio ativo para analgésicos e antitérmicos em formulações farmacêuticas. Risco principal: risco químico baixo para manuseio; perigo clínico em overdose (não aplicável como risco ocupacional normal). Medida de segurança crítica: higiene pessoal, evitar contaminação cruzada em áreas de produção farmacêutica; uso de máscara e luvas para manter pureza.", "Farmacêuticos", "1764869422520-Paracetamol_API_Bag_Product_Shot.png", "1764869422618-Pristine_Pharma_Warehouse_Interior_Low_Angle.png", "1764869422718-Sterile_Pharma_Weighing_Cleanroom_Precision.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Ibuprofeno (API grau farmacêutico) 25kg", 2, 9800, "Fórmula: C₁₃H₁₈O₂ (sólido cristalino). Aplicações: analgésico/anti-inflamatório em formulações sólidas e líquidas. Risco principal: pó pode causar irritação respiratória; requisitos de controle de qualidade para pureza e dosagem. Medida de segurança crítica: manuseio em sala limpa com controle de poeira, EPI para operadores e procedimentos de contenção para evitar contaminação.", "Farmacêuticos", "1764903722632-Ibuprofen_API_25kg_Studio_Shot.png", "1764903722997-Pharma_Warehouse_Ibuprofen_API_Storage.png", "1764903723363-Sterile_Powder_Transfer_GMP_Cleanroom.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Doxorrubicina (polvo/liofilizado — citotóxico) 50mg", 3, 1950.00, "Fórmula: C₂₇H₂₉NO₁₁ (sólido, pó liofilizado). Aplicações: quimioterápico antineoplásico (uso hospitalar). Risco principal: citotoxicidade elevada; exposição pode causar danos genotóxicos e riscos graves à saúde. Medida de segurança crítica: manipular apenas em áreas controladas (cabine de segurança biológica ou sistema fechado), EPI citostático completo, descarte conforme normas para resíduos citotóxicos.", "Farmacêuticos", "1764904363142-Doxorubicin_Vial_Cytotoxic_Detail.png", "1764904363607-Pharma_Freezer_Doxorubicin_Controlled_Storage.png", "1764904363721-Aseptic_Chemo_Reconstitution_BSC.png");

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Álcool cetílico (álcool graxo emoliente, C16H34O — pastilha/escamas) 25kg", 1, 300.00, "Fórmula: C₁۶H₃۴O (sólido/cera). Aplicações: emoliente/espessante em cremes e loções, veículo em cosméticos. Risco principal: irritação mínima; risco baixo. Medida crítica: armazenagem ao abrigo de umidade e manuseio com luvas padrão.", "Cosméticos", "1764786319355-Cetyl_Alcohol_Flakes_Product_Shot.png", "1764786319418-Cosmetic_Warehouse_Cetyl_Alcohol_Storage.png", "1764786319473-Cosmetic_Formulation_Precision_Weighing.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Propilenoglicol (PG) grau cosmético 200L", 2, 1750.00, "Fórmula: C₃H₈O₂ (líquido). Aplicações: solvente e umectante em cosméticos e fragrâncias; veículo para ativos. Risco principal: irritação cutânea em concentrações altas e sensibilidade em peles sensíveis; risco moderado em ingestão. Medida de segurança crítica: controle de concentração nas formulações, rotulagem adequada e EPI padrão ao manusear grandes volumes.", "Cosméticos", "1764905077689-Cosmetic_Propylene_Glycol_Drum_Premium_Shot.png", "1764905078024-Cosmetic_Warehouse_Quality_Control.png", "1764905078330-Cosmetic_Automation_Dosing_Production.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Hidroquinona (grau cosmético/dermatológico) — uso regulado 1kg", 3, 2200.00, "Fórmula: C₆H₆O₂ (sólido cristalino). Aplicações: despigmentante tópico (uso dermatológico sob prescrição e regulado). Risco principal: potencial para irritação severa, sensibilização e preocupações toxicológicas; uso sujeito a restrições. Medida de segurança crítica: manusear em área controlada com EPI (luvas, óculos), seguir regulamentos locais para comercialização e rotulagem, limitar exposição dos trabalhadores.", "Cosméticos", "1764938406260-Pharma_HDPE_Bottle_Safety_Label.png", "1764938406754-Controlled_Substance_Storage_Compliance.png", "1764938408770-Pharma_Precision_Weighing_Containment.png");

INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Água purificada (aqua purificada) grau reagente 20L", 1, 45.00, "Fórmula: H₂O (líquido). Aplicações: solvente universal em análises, preparação de soluções-padrão e limpeza de vidrarias. Risco principal: risco químico praticamente nulo; risco de contaminação se não manuseada corretamente. Medida de segurança crítica: manter recipientes limpos e vedados para evitar contaminação microbiana.", "Reagente", "1764939624048-Pure_Water_Carboy_Studio_Shot.png", "1764939624452-Regent_Lab_Storage_Clean.png", "1764939624687-Aseptic_HPLC_Transfer.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Hipoclorito de sódio 10% (solução desinfetante) 20L", 2, 75.00, "Fórmula: NaOCl (solução aquosa). Aplicações: desinfecção de superfícies, limpeza de vidrarias, tratamento de água em laboratório. Risco principal: corrosivo para tecidos mucosos; reação com ácidos libera cloro gasoso tóxico. Medida de segurança crítica: evitar mistura com ácidos/amônia; EPI (luvas, óculos) e ventilação; usar armazenamento adequado.", "Reagente", "1764939937077-Hypochlorite_Carboy_Safety_Studio.png", "1764939937406-Chemical_Warehouse_Safety_Storage.png", "1764939937684-Safe_Dilution_Industrial_Photography.png");
INSERT INTO produto (nome, id_classificacao, preco, descricao, categoria, imagem1, imagem2, imagem3) values ("Ácido nítrico (HNO₃, P.A. 65–70%, líquido) 1L", 3, 250.00, "Fórmula: HNO₃ (líquido oxidante). Aplicações: síntese orgânica, limpeza de vidrarias, preparação de sais/nitratos, análise. Risco principal: forte corrosivo e oxidante, libera vapores tóxicos e fomenta combustão de materiais orgânicos; reações vigorosas com metais. Medida crítica: capela, EPI completo e armazenamento em local ventilado e compatível (recipientes plásticos/vidro especiais).", "Reagente", "1764869301988-Nitric_Acid_Bottle_Studio_Shot.png", "1764869302085-Acid_Cabinet_Safety_Storage.png", "1764869302166-Chemist_Nitric_Acid_Safety_Lab.png");

CREATE TABLE autorizacoes_categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    nivel INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id)
);

select * from empresa;
select * from produto;
select * from lotes;
select * from itensPedidos;
select * from pedido;
select * from autorizacoes_categoria;