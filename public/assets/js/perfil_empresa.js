const idEmpresa = localStorage.getItem("idEmpresa");
const idUsuario = localStorage.getItem("idUsuarioEmpresa");

const modal = document.getElementById("modalFoto");
const inputFoto = document.getElementById("inputFoto");
const previewFoto = document.getElementById("previewFoto");

let fotoBase64 = "";

/* ================= EMPRESA ================= */
async function carregarEmpresa() {
  const res = await fetch(`http://localhost:3000/empresas/${idEmpresa}`);
  const e = await res.json();

  fotoEmpresaMini.src = fotoEmpresaGrande.src = e.fotoEmpresa || "https://via.placeholder.com/150";
  nomeEmpresaMini.textContent = e.nome;
  emailEmpresaMini.textContent = e.email;

  empresa_nome.value = e.nome;
  empresa_email.value = e.email;
  empresa_cnpj.value = e.cnpj;
  empresa_endereco.value = e.endereco;
  empresa_cep.value = e.cep;
  empresa_descricao.value = e.descricao;
}

/* ================= USUÁRIO ================= */
async function carregarUsuario() {
  const res = await fetch(`http://localhost:3000/usuarioEmpresa/${idUsuario}`);
  const u = await res.json();

  usuario_nome.value = u.nomeUsuario;
  usuario_cpf.value = u.cpf;
  usuario_cargo.value = u.cargo;
  usuario_turno.value = u.turno;
  usuario_senha.value = u.senha;
}

/* ================= SALVAR ================= */
async function salvarEmpresa() {
  await fetch(`http://localhost:3000/empresas/${idEmpresa}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: empresa_nome.value,
      email: empresa_email.value,
      cnpj: empresa_cnpj.value,
      endereco: empresa_endereco.value,
      cep: empresa_cep.value,
      descricao: empresa_descricao.value
    })
  });
  alert("Empresa atualizada!");
}

async function salvarUsuario() {
  await fetch(`http://localhost:3000/usuarioEmpresa/${idUsuario}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nomeUsuario: usuario_nome.value,
      cpf: usuario_cpf.value,
      cargo: usuario_cargo.value,
      turno: usuario_turno.value,
      senha: usuario_senha.value
    })
  });
  alert("Usuário atualizado!");
}

/* ================= FOTO ================= */
function editarFotoEmpresa() {
  modal.style.display = "flex";
}

inputFoto.addEventListener("change", () => {
  const file = inputFoto.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    fotoBase64 = reader.result;
    previewFoto.src = fotoBase64;
  };
  reader.readAsDataURL(file);
});

async function salvarFoto() {
  await fetch(`http://localhost:3000/empresas/${idEmpresa}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fotoEmpresa: fotoBase64 })
  });
  fecharModal();
  carregarEmpresa();
}

function fecharModal() {
  modal.style.display = "none";
}

/* ================= LOGOUT ================= */
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "loginEmpresa.html";
});

/* INIT */
carregarEmpresa();
carregarUsuario();
