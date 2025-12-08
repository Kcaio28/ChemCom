CREATE TABLE autorizacoes_categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    nivel INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id)
);