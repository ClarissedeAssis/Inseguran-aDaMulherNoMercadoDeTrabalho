// ================================
// CONFIGURAÇÃO DO JSON SERVER
// ================================
const API = "http://localhost:3000";

// ================================
// VERIFICAR USUÁRIO LOGADO
// ================================
function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

function exigirLogin() {
  const user = getUsuarioLogado();
  if (!user) {
    alert("Você precisa estar logado para fazer uma avaliação.");
    window.location.href = "loginUsuario.html";
  }
}
exigirLogin();

// ================================
// Carregar empresas
// ================================
async function carregarEmpresas() {
  const empresaSelect = document.getElementById("empresaSelect");
  empresaSelect.innerHTML = `<option value="">Selecione uma empresa</option>`;

  const empresas = await (await fetch(`${API}/empresas`)).json();

  empresas.forEach(emp => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = emp.nome;
    empresaSelect.appendChild(opt);
  });
}
carregarEmpresas();

// ================================
// Sistema de estrelas (Novo)
// ================================
const stars = document.querySelectorAll("#ratingStars i");
const notaInput = document.getElementById("nota");

stars.forEach(star => {
  star.addEventListener("click", function () {
    const value = Number(this.dataset.value);
    notaInput.value = value;

    stars.forEach(s => s.classList.remove("active", "bi-star-fill"));
    stars.forEach(s => s.classList.add("bi-star"));

    for (let i = 0; i < value; i++) {
      stars[i].classList.add("active", "bi-star-fill");
      stars[i].classList.remove("bi-star");
    }
  });
});

// ================================
// Renderizar avaliações
// ================================
async function renderAvaliacoes() {
  const section = document.getElementById("minhasAvaliacoes");
  section.innerHTML = "";

  const user = getUsuarioLogado();
  if (!user) return;

  const avaliacoes = await (await fetch(`${API}/avaliacoes?usuarioId=${user.id}`)).json();
  const empresas = await (await fetch(`${API}/empresas`)).json();

  avaliacoes.forEach(av => {
    const empresa = empresas.find(e => e.id == av.empresaId);
    const estrelas = "★".repeat(av.nota) + "☆".repeat(5 - av.nota);

    const card = document.createElement("div");
    card.className = "card p-3 my-2";
    card.id = `avaliacao-${av.id}`;

    card.innerHTML = `
      <h4>${av.anonima ? "Avaliação Anônima" : user.nome}</h4>
      <p><strong>Empresa:</strong> ${empresa?.nome || "Desconhecida"}</p>
      <p><strong>Aspecto:</strong> ${av.aspecto}</p>
      <p>${estrelas}</p>
      <p>${av.comentario}</p>
      <p><strong>Data:</strong> ${av.dataLocal}</p>

      <button class="btn btn-warning me-2 btn-edit">Editar</button>
      <button class="btn btn-danger btn-delete">Excluir</button>
    `;

    card.querySelector(".btn-edit").onclick = () => editarAvaliacao(av);
    card.querySelector(".btn-delete").onclick = () => excluirAvaliacao(av.id, av.empresaId);

    section.appendChild(card);
  });
}
renderAvaliacoes();

// ================================
// Atualizar média
// ================================
async function atualizarMediaEmpresa(empresaId) {
  const avaliacoes = await (await fetch(`${API}/avaliacoes?empresaId=${empresaId}`)).json();

  const quantidadeAvaliacoes = avaliacoes.length;
  const media = quantidadeAvaliacoes > 0
    ? avaliacoes.reduce((acc, a) => acc + Number(a.nota), 0) / quantidadeAvaliacoes
    : 0;

  await fetch(`${API}/empresas/${empresaId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      avaliacaoTotal: media,
      quantidadeAvaliacoes: quantidadeAvaliacoes
    })
  });
}

// ================================
// Enviar avaliação
// ================================
document.getElementById("avaliacaoForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const user = getUsuarioLogado();

  const empresaId = empresaSelect.value;
  const aspecto = document.getElementById("aspecto").value;
  const nota = Number(document.getElementById("nota").value);
  const comentario = document.getElementById("comentario").value;
  const data = document.getElementById("dataAvaliacao").value;
  const tipo = document.querySelector("input[name='tipoAvaliacao']:checked").value;

  if (!empresaId || !aspecto || !nota || !comentario || !data) {
    alert("Preencha todos os campos!");
    return;
  }

  await fetch(`${API}/avaliacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresaId,
      aspecto,
      nota,
      comentario,
      dataLocal: data,
      anonima: tipo === "anonima",
      usuarioId: user.id
    })
  });

  await atualizarMediaEmpresa(empresaId);

  this.reset();
  stars.forEach(s => s.classList.remove("active", "bi-star-fill"));

  renderAvaliacoes();
});

async function editarAvaliacao(av) {
  const card = document.getElementById(`avaliacao-${av.id}`);
  if (!card) return;

  card.innerHTML = `
    <label><strong>Aspecto:</strong></label>
    <select id="editAspecto" class="form-select mb-2">
      <option ${av.aspecto === "Atendimento" ? "selected" : ""}>Atendimento</option>
      <option ${av.aspecto === "Ambiente de Trabalho" ? "selected" : ""}>Ambiente de Trabalho</option>
      <option ${av.aspecto === "Segurança" ? "selected" : ""}>Segurança</option>
      <option ${av.aspecto === "Gestão" ? "selected" : ""}>Gestão</option>
    </select>

    <label><strong>Nota:</strong></label>
    <div id="editStars" class="stars mb-2">
      ${[1,2,3,4,5].map(n =>
        `<i data-value="${n}" class="bi ${n <= av.nota ? "bi-star-fill active" : "bi-star"}"></i>`
      ).join("")}
    </div>

    <label><strong>Comentário:</strong></label>
    <textarea id="editComentario" class="form-control mb-3">${av.comentario}</textarea>

    <div class="edit-actions">
      <button class="btn-salvar btn btn-success me-2">Salvar</button>
      <button class="btn-cancelar btn btn-secondary">Cancelar</button>
    </div>
  `;

  // sistema interno de estrelas
  const sEdit = card.querySelectorAll("#editStars i");
  let newNota = av.nota;

  sEdit.forEach(st => {
    st.onclick = () => {
      newNota = Number(st.dataset.value);
      sEdit.forEach(s => s.classList.remove("active", "bi-star-fill"));
      sEdit.forEach(s => s.classList.add("bi-star"));
      for (let i = 0; i < newNota; i++) {
        sEdit[i].classList.add("active", "bi-star-fill");
        sEdit[i].classList.remove("bi-star");
      }
    };
  });

  // SALVAR — agora FUNCIONA
  card.querySelector(".btn-salvar").onclick = async () => {
    await fetch(`${API}/avaliacoes/${av.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aspecto: document.getElementById("editAspecto").value,
        comentario: document.getElementById("editComentario").value,
        nota: newNota
      })
    });

    await atualizarMediaEmpresa(av.empresaId);
    renderAvaliacoes();
  };

  // CANCELAR — agora FUNCIONA
  card.querySelector(".btn-cancelar").onclick = renderAvaliacoes;
}


// ================================
// Excluir
// ================================
async function excluirAvaliacao(id, empresaId) {
  if (!confirm("Deseja excluir?")) return;

  await fetch(`${API}/avaliacoes/${id}`, { method: "DELETE" });
  await atualizarMediaEmpresa(empresaId);

  renderAvaliacoes();
}
