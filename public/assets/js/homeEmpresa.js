function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  const nomeEmpresaHeader = document.getElementById("nomeEmpresaHeader");
  const nomeFuncionarioHeader = document.getElementById("nomeFuncionarioHeader");

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    nomeEmpresaHeader.textContent = "Empresa não identificada";
    nomeFuncionarioHeader.textContent = "";
    return;
  }

  // Exibe o nome do funcionário logado
  nomeFuncionarioHeader.textContent = `Funcionário: ${usuarioLogado.nome}`;

  try {
    // Buscar dados da empresa
    const response = await fetch("http://localhost:3000/empresas");
    const empresas = await response.json();

    const empresa = empresas.find(e => e.id === usuarioLogado.empresaId);

    if (empresa) {
      nomeEmpresaHeader.textContent = `Empresa: ${empresa.nome}`;
    } else {
      nomeEmpresaHeader.textContent = "Empresa não encontrada";
    }
  } catch (error) {
    console.error("Erro ao carregar empresa:", error);
    nomeEmpresaHeader.textContent = "Erro ao carregar empresa";
  }
});


// CONFIGURA O BOTÃO PARA PASSAR O idEmpresa PARA A PÁGINA DE CADASTRO
document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const btn = document.getElementById("btnCadastroUsuarioEmpresa");

  if (usuarioLogado && usuarioLogado.empresaId) {
    btn.href = `cadastroUsuarioEmpresa.html?idEmpresa=${usuarioLogado.empresaId}`;
  } else {
    console.warn("Empresa não encontrada no login.");
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const btnLogout = document.getElementById("btnLogout");

  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado"); 
    window.location.href = "loginEmpresa.html"; 
  });
});
