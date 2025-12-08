import { CATEGORIAS_CNAE } from "../utils/cnaesCategorias.js";
import UsuarioModel from "../models/UsuarioModel.js";

async function processarAutorizacoesCategorias(idEmpresa, cnaes) {
    const autorizacoes = [];

    // Normaliza todos os CNAEs recebidos
    const cnaesNormalizados = cnaes.map(c => normalizarCNAE(c));

    for (const categoria in CATEGORIAS_CNAE) {
        const niveis = CATEGORIAS_CNAE[categoria];

        let nivelEncontrado = 0;

        for (const nivel in niveis) {
            const listaCnaes = niveis[nivel];

            for (const cnae of cnaesNormalizados) {
                if (listaCnaes.includes(cnae)) {
                    // Extrai número do nível (nivel1 → 1)
                    nivelEncontrado = parseInt(nivel.replace("nivel", ""));
                }
            }
        }

        // Só salva se encontrou algum nível
        if (nivelEncontrado > 0) {
            autorizacoes.push({
                id_empresa: idEmpresa,
                categoria,
                nivel: nivelEncontrado
            });

            await UsuarioModel.salvarAutorizacaoCategoria(
                idEmpresa,
                categoria,
                nivelEncontrado
            );
        }
    }

    return autorizacoes;
}

export default processarAutorizacoesCategorias;
