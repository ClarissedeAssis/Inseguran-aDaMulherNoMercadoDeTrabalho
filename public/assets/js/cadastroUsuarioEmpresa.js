document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuarioEmpresa");
  const nomeEmpresaInput = document.getElementById("nomeEmpresa");
  const cnpjInput = document.getElementById("cnpj");
  const cpfInput = document.getElementById("cpf");

  const urlParams = new URLSearchParams(window.location.search);
  const idEmpresa = urlParams.get("idEmpresa");

  if (!idEmpresa) {
    alert("ID da empresa não encontrado.");
    window.location.href = "cadastrarEmpresas.html";
    return;
  }


  fetch(`http://localhost:3000/empresas/${idEmpresa}`)
    .then(response => response.json())
    .then(empresa => {
      nomeEmpresaInput.value = empresa.nome || "";
      cnpjInput.value = empresa.cnpj || "";
    })
    .catch(error => console.error("Erro ao carregar empresa:", error));

  
  cpfInput.addEventListener("input", e => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e.target.value = value;
  });

  
  form.addEventListener("submit", e => {
    e.preventDefault();

    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();

    if (senha !== confirmarSenha) {
      alert("As chaves de acesso não coincidem!");
      return;
    }

    const novoUsuario = {
      empresaId: Number(idEmpresa),
      cpf: cpfInput.value.trim(),
      cargo: document.getElementById("cargo").value.trim(),
      turno: document.getElementById("turno").value.trim(),
      nomeUsuario: document.getElementById("nomeUsuario").value.trim(),
      senha
    };

    fetch("http://localhost:3000/usuarioEmpresa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario)
    })
      .then(response => {
        if (!response.ok) throw new Error("Erro ao cadastrar.");
        return response.json();
      })
      .then(() => {
        alert("Usuário cadastrado!");
        form.reset();
        setTimeout(() => (window.location.href = "loginEmpresa.html"), 1500);
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao cadastrar usuário.");
      });
  });
});
