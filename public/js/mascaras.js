document.addEventListener("DOMContentLoaded", () => {

    // TELEFONE
    const telefone = document.getElementById("telefone");
    if (telefone) IMask(telefone, { mask: '(00) 00000-0000' });

    // CNPJ
    const cnpj = document.getElementById("cnpj");
    if (cnpj) IMask(cnpj, { mask: '00.000.000/0000-00' });

    // CEP
    const cep = document.getElementById("cep");
    if (cep) IMask(cep, { mask: '00000-000' });

});
