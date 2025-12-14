document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLoginEmpresa");
  const cnpjInput = document.getElementById("cnpj");

  cnpjInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 14) value = value.slice(0, 14);

    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");

    e.target.value = value;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cnpj = cnpjInput.value.trim().replace(/\D/g, "");
    const nomeUsuario = document.getElementById("nomeUsuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!cnpj || !nomeUsuario || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const empresasRes = await fetch("http://localhost:3000/empresas");
      const empresas = await empresasRes.json();

      const empresa = empresas.find(e => e.cnpj.replace(/\D/g, "") === cnpj);
      if (!empresa) {
        alert("Empresa não encontrada!");
        return;
      }

      const usuariosRes = await fetch("http://localhost:3000/usuarioEmpresa");
      const usuarios = await usuariosRes.json();

      const usuario = usuarios.find(
        u =>
          u.empresaId === Number(empresa.id) &&
          u.nomeUsuario === nomeUsuario &&
          u.senha === senha
      );

      if (!usuario) {
        alert("Nome de usuário ou senha incorretos!");
        return;
      }

      alert("Login realizado com sucesso!");

      // 🔹 Salvar dados importantes no localStorage
      localStorage.setItem("idEmpresa", empresa.id);
      localStorage.setItem("nomeEmpresa", empresa.nome);
      localStorage.setItem("idUsuarioEmpresa", usuario.id);
      localStorage.setItem("usuarioLogado", JSON.stringify({
        nome: usuario.nomeUsuario,
        empresaId: empresa.id
      }));

      // 🔹 Redirecionar para a home
      window.location.href = "homeEmpresa.html";

    } catch (err) {
      console.error("Erro no login:", err);
      alert("Erro no login, tente novamente.");
    }
  });
});
