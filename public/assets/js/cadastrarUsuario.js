document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuario");
  const fotoInput = document.getElementById("fotoPerfil");
  const previewFoto = document.getElementById("previewFoto");
  const fileLabel = document.getElementById("fileLabel");

  // -------------------------------
  // PREVIEW DA FOTO
  // -------------------------------
  fotoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) {
      previewFoto.src = "";
      previewFoto.style.display = "none";
      fileLabel.textContent = "Clique ou arraste a imagem";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      previewFoto.src = reader.result;
      previewFoto.style.display = "block";
      fileLabel.textContent = file.name;
    };

    reader.readAsDataURL(file);
  });

  // -------------------------------
  // VALIDAÇÃO SIMPLES DO NÚMERO DE CELULAR
  // -------------------------------
  document.getElementById("numeroCelular").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 11);
  });

  // -------------------------------
  // ENVIO DO FORMULÁRIO
  // -------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
    const numeroCelular = document.getElementById("numeroCelular").value.trim();
    const localizacao = document.getElementById("localizacao").value.trim();

    if (!nome || !email || !senha || !confirmarSenha || !numeroCelular || !localizacao) {
      alert("Preencha todos os campos!");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    // CARREGA TODOS OS USUÁRIOS PARA DEFINIR PRÓXIMO ID
    let usuarios = [];
    try {
      const res = await fetch("http://localhost:3000/usuarios");
      usuarios = await res.json();
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      alert("Erro no servidor.");
      return;
    }

    const novoId = usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1;

    // Se houver imagem, salvar como base64
    let fotoPerfil = "";
    if (previewFoto.src && previewFoto.src !== window.location.href) {
      fotoPerfil = previewFoto.src;
    }

    const novoUsuario = {
      id: novoId,
      nome,
      email,
      senha,
      fotoPerfil,
      numeroCelular,
      localizacao
    };

    console.log("Usuário enviado:", novoUsuario);

    // ENVIA PARA O JSON-SERVER
    try {
      const res = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario)
      });

      if (!res.ok) throw new Error("Erro ao cadastrar usuário.");

      alert("Usuária cadastrada com sucesso!");
      window.location.href = "loginUsuario.html";

    } catch (err) {
      console.error("Erro ao enviar dados:", err);
      alert("Erro ao cadastrar usuário. Tente novamente.");
    }
  });
});
