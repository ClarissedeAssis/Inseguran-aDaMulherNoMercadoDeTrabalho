const tipoContratoLabels = {
  clt: "CLT",
  pj: "Pessoa Jurídica",
  temporary: "Temporário"
};

let todasVagas = [];
let empresasMap = {};

async function carregarVagas() {
  try {
    const [resVagas, resEmpresas] = await Promise.all([
      fetch("http://localhost:3000/vagas"),
      fetch("http://localhost:3000/empresas")
    ]);

    if (!resVagas.ok || !resEmpresas.ok) throw new Error();

    const vagas = await resVagas.json();
    const empresas = await resEmpresas.json();

    // MAPA DE EMPRESAS (CORRIGIDO)
    empresas.forEach(emp => {
      empresasMap[emp.id] = emp.nomeEmpresa || emp.nome || "Empresa não informada";
    });

    todasVagas = vagas;
    aplicarFiltros();

  } catch (e) {
    console.error(e);
    document.getElementById("listaVagas").innerHTML =
      "<p style='text-align:center;'>Erro ao carregar vagas.</p>";
  }
}

function mostrarVagas(lista) {
  const divLista = document.getElementById("listaVagas");
  divLista.innerHTML = "";

  if (!lista || lista.length === 0) {
    divLista.innerHTML =
      "<p style='text-align:center;'>Nenhuma vaga encontrada :(</p>";
    return;
  }

  lista.forEach(v => {
    const nomeEmpresa = empresasMap[v.empresaId] || "Empresa não informada";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${v.titulo}</h3>
      <p><b>Empresa:</b> ${nomeEmpresa}</p>
      <p><b>Local:</b> ${v.local}</p>
      <p><b>Salário:</b> ${v.salario}</p>
      <p><b>Contrato:</b> ${tipoContratoLabels[v.tipoContrato.toLowerCase()] || v.tipoContrato}</p>

      <button class="btn btn-pink btn-candidatar">
        Candidatar-se
      </button>
    `;

    card.querySelector(".btn-candidatar")
      .addEventListener("click", e => {
        e.stopPropagation();
        candidatar(v.id);
      });

    card.addEventListener("click", () => mostrarDetalhes(v));

    divLista.appendChild(card);
  });
}

function mostrarDetalhes(vaga) {
  const divLista = document.getElementById("listaVagas");
  const nomeEmpresa = empresasMap[vaga.empresaId] || "Empresa não informada";

  divLista.innerHTML = `
    <div class="card card-detalhe">
      <h3>${vaga.titulo}</h3>
      <p><b>Empresa:</b> ${nomeEmpresa}</p>
      <p><b>Local:</b> ${vaga.local}</p>
      <p><b>Descrição:</b> ${vaga.descricao}</p>
      <p><b>Requisitos:</b> ${vaga.requisitos.join(", ")}</p>
      <p><b>Contrato:</b> ${tipoContratoLabels[vaga.tipoContrato.toLowerCase()] || vaga.tipoContrato}</p>
      <p><b>Publicado em:</b>
        ${new Date(vaga.dataPublicacao).toLocaleDateString("pt-BR")}
      </p>

      <button class="btn btn-pink btn-candidatar">
        Candidatar-se
      </button>

      <button class="btn btn-secondary" id="btnVoltar">
        ← Voltar
      </button>
    </div>
  `;

  document.querySelector(".btn-candidatar")
    .addEventListener("click", () => candidatar(vaga.id));

  document.getElementById("btnVoltar")
    .addEventListener("click", aplicarFiltros);
}

function candidatar(vagaId) {
  window.location.href = `curriculos.html?vagaId=${vagaId}`;
}

function aplicarFiltros() {
  const termo = document.getElementById("buscaTopo").value.toLowerCase().trim();
  const contrato = document.getElementById("filtroContrato").value;

  const filtradas = todasVagas.filter(v => {
    if (v.status !== "ativa") return false;

    const textoBusca = (
      v.titulo +
      " " +
      v.local +
      " " +
      (empresasMap[v.empresaId] || "")
    ).toLowerCase();

    const condBusca = termo ? textoBusca.includes(termo) : true;

    const condContrato = contrato
      ? v.tipoContrato.toLowerCase() === contrato
      : true;

    return condBusca && condContrato;
  });

  mostrarVagas(filtradas);
}

document.getElementById("btnBuscarTopo").onclick = aplicarFiltros;

document.getElementById("buscaTopo")
  .addEventListener("keypress", e => {
    if (e.key === "Enter") aplicarFiltros();
  });

document.getElementById("filtroContrato")
  .addEventListener("change", aplicarFiltros);

document.addEventListener("DOMContentLoaded", carregarVagas);
