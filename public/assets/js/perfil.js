const API = "http://localhost:3000/usuarios";

const btnLogout = document.getElementById("btnLogout");
const btnSalvar = document.getElementById("btnSalvar");

const fotoPerfil = document.getElementById("fotoPerfil");
const fotoSidebar = document.getElementById("fotoSidebar");
const inputFoto = document.getElementById("inputFoto");

const nomeTopo = document.getElementById("nomeTopo");
const emailTopo = document.getElementById("emailTopo");
const nomeSidebar = document.getElementById("nomeSidebar");
const emailSidebar = document.getElementById("emailSidebar");

const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
const inputTelefone = document.getElementById("telefone");
const inputLocalizacao = document.getElementById("localizacao");
const inputSenha = document.getElementById("senha");

let fotoAtual = "assets/images/avatar.png";

/* ========= USUÁRIO LOGADO ========= */
function getUsuarioLogado() {
  const usuario = localStorage.getItem("usuarioLogado");
  return usuario ? JSON.parse(usuario) : null;
}

/* ========= CARREGAR PERFIL ========= */
async function carregarPerfil() {
  const usuarioLogado = getUsuarioLogado();

  if (!usuarioLogado) {
    alert("Usuário não identificado. Faça login novamente.");
    window.location.href = "loginUsuario.html";
    return;
  }

  try {
    const res = await fetch(`${API}/${usuarioLogado.id}`);
    const u = await res.json();

    inputNome.value = u.nome || "";
    inputEmail.value = u.email || "";
    inputSenha.value = u.senha || "";
    inputTelefone.value = u.numeroCelular || "";
    inputLocalizacao.value = u.localizacao || "";

    nomeTopo.textContent = u.nome;
    emailTopo.textContent = u.email;
    nomeSidebar.textContent = u.nome;
    emailSidebar.textContent = u.email;

    fotoAtual = u.fotoPerfil && u.fotoPerfil !== ""
      ? u.fotoPerfil
      : "assets/images/avatar.png";

    fotoPerfil.src = fotoAtual;
    fotoSidebar.src = fotoAtual;

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar perfil.");
  }
}

/* ========= FOTO ========= */
inputFoto.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    fotoAtual = reader.result;
    fotoPerfil.src = fotoAtual;
    fotoSidebar.src = fotoAtual;
  };
  reader.readAsDataURL(file);
});

/* ========= SALVAR ========= */
btnSalvar.addEventListener("click", async () => {
  const usuarioLogado = getUsuarioLogado();
  if (!usuarioLogado) return;

  const atualizado = {
    nome: inputNome.value.trim(),
    email: inputEmail.value.trim(),
    senha: inputSenha.value.trim(),
    fotoPerfil: fotoAtual,
    numeroCelular: inputTelefone.value.trim(),
    localizacao: inputLocalizacao.value.trim()
  };

  if (!atualizado.nome || !atualizado.email || !atualizado.senha) {
    alert("Nome, email e senha são obrigatórios.");
    return;
  }

  try {
    const res = await fetch(`${API}/${usuarioLogado.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado)
    });

    const usuarioAtualizado = await res.json();
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

    alert("Perfil atualizado com sucesso!");
    carregarPerfil();

  } catch (err) {
    console.error(err);
    alert("Erro ao salvar perfil.");
  }
});

/* ========= LOGOUT ========= */
btnLogout.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "loginUsuario.html";
});




carregarPerfil();
