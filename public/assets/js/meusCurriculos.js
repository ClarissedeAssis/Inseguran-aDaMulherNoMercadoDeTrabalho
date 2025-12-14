document.addEventListener("DOMContentLoaded", () => {

  const API_CURRICULOS = "http://localhost:3000/curriculo";
  const API_VAGAS = "http://localhost:3000/vagas";

  const lista = document.getElementById("listaCurriculos");
  const preview = document.getElementById("preview");

  async function carregarCurriculos() {
    try {
      const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
      const userId = usuarioLogado?.id;

      if (!userId) {
        lista.innerHTML = `
          <p style="text-align:center;color:#6b7280;">
            Usuário não identificado.
          </p>
        `;
        return;
      }

      const [resCurriculos, resVagas] = await Promise.all([
        fetch(API_CURRICULOS),
        fetch(API_VAGAS)
      ]);

      const curriculos = await resCurriculos.json();
      const vagas = await resVagas.json();

      const enviados = curriculos.filter(
        c => c.statusEnvio === "enviado" &&
             String(c.userId) === String(userId)
      );

      if (enviados.length === 0) {
        lista.style.width = "100%";
        lista.innerHTML = `
          <p style="text-align:center;color:#6b7280;margin-top:20px;">
            Você ainda não aplicou para nenhuma vaga.
          </p>
        `;
        return;
      }

      lista.innerHTML = "";
      preview.style.display = "none";

      enviados.forEach(curriculo => {
        const vaga = vagas.find(
          v => String(v.id) === String(curriculo.vagaId)
        );
        criarCard(curriculo, vaga);
      });

    } catch (error) {
      console.error(error);
      lista.innerHTML = `
        <p style="text-align:center;color:#ff2d6f;">
          Erro ao carregar currículos.
        </p>
      `;
    }
  }

  function criarCard(c, vaga) {
    const card = document.createElement("div");
    card.className = "card curriculo-card";

    card.innerHTML = `
      <h3>${vaga?.titulo || "Vaga não encontrada"}</h3>
      <p><b>Local:</b> ${vaga?.local || "—"}</p>
      <p><b>Contrato:</b> ${vaga?.tipoContrato || "—"}</p>
      <p><b>Salário:</b> ${vaga?.salario || "—"}</p>
      <span class="status">Enviado</span>
    `;

    card.onclick = () => mostrarPreview(c, vaga);
    lista.appendChild(card);
  }

  function mostrarPreview(c, vaga) {
    preview.style.display = "block";

    preview.innerHTML = `
      <h3>${vaga?.titulo || "Detalhes da vaga"}</h3>
      <p><b>Descrição:</b> ${vaga?.descricao || "—"}</p>
      <p><b>Local:</b> ${vaga?.local || "—"}</p>
      <p><b>Contrato:</b> ${vaga?.tipoContrato || "—"}</p>
      <p><b>Salário:</b> ${vaga?.salario || "—"}</p>

      <hr>

      <p><b>Nome:</b> ${c.nome}</p>
      <p><b>E-mail:</b> ${c.email}</p>
      <p><b>Contato:</b> ${c.contato}</p>
      <p><b>Área:</b> ${c.areaAtuacao}</p>
      <p><b>Formação:</b> ${c.formacao}</p>
      <p><b>Habilidades:</b> ${c.habilidades.join(", ")}</p>
      <p><b>Objetivo:</b> ${c.objetivo}</p>
      <p><b>Experiência:</b> ${c.experiencia}</p>
    `;

    preview.scrollIntoView({ behavior: "smooth" });
  }

  carregarCurriculos();
});
