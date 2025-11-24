import bcrypt from "bcryptjs";

const senha = "12345";
const saltRounds = 10;

// bcrypt.hash(senha, saltRounds, (err, hash) => {
//     if (err) {
//         console.error("Erro ao gerar hash:", err);
//         return;
//     }
//     console.log("Hash gerado:", hash);
// });

const hashSalvo = "$2a$10$E3rMj.jZXzXy9Xrk6DZfk.WIn6ez/eeyPZD9Q/KkucQBqnnZomtNq";

bcrypt.compare(senha, hashSalvo).then(resultado => {
    if (resultado) {
        console.log("Senha correta!");
    } else {
        console.log("Senha incorreta!");
    }
});