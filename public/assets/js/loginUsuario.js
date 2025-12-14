document.getElementById("formLoginUsuarioEmpresa").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("nomeUsuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    try {
        const res = await fetch("http://localhost:3000/usuarios");
        const usuarios = await res.json();

        const usuarioEncontrado = usuarios.find(u => u.nome === email && u.senha === senha);

        if (!usuarioEncontrado) {
            alert("Usuário ou senha incorretos.");
            return;
        }

        const usuarioLogado = {
            id: usuarioEncontrado.id,
            nome: usuarioEncontrado.nome,
            email: usuarioEncontrado.email,
            cpf: usuarioEncontrado.cpf,
            fotoPerfil: usuarioEncontrado.fotoPerfil || "",
            numeroCelular: usuarioEncontrado.numeroCelular || ""
        };

        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

        alert("Login realizado com sucesso!");
        window.location.href = "homepage.html";

    } catch (err) {
        console.error(err);
        alert("Erro ao fazer login.");
    }
});
