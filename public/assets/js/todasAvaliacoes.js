const API = "http://localhost:3000";

async function carregarAvaliacoes() {
  const container = document.getElementById("listaAvaliacoes");
  container.innerHTML = "";

  try {
    const avaliacoes = await (await fetch(`${API}/avaliacoes`)).json();
    const empresas   = await (await fetch(`${API}/empresas`)).json();
    const usuarios   = await (await fetch(`${API}/usuarios`)).json();

    if (avaliacoes.length === 0) {
      container.innerHTML = `
        <p style="text-align:center; color:#777;">
          Nenhuma avaliação encontrada.
        </p>
      `;
      return;
    }

    avaliacoes.forEach(av => {
      const empresa = empresas.find(e => e.id == av.empresaId);
      const autor   = usuarios.find(u => u.id == av.usuarioId);

      const estrelas =
        "★".repeat(av.nota) + "☆".repeat(5 - av.nota);

      // CARD PRINCIPAL
      const card = document.createElement("div");
      card.className = "avaliacao-card";

      card.innerHTML = `
        <div class="avaliacao-top">
          <div class="avaliacao-empresa">
            ${empresa?.nome || "Empresa não encontrada"}
          </div>

          <div class="avaliacao-stars">
            ${estrelas}
          </div>
        </div>

        <div class="avaliacao-divider"></div>

        <div class="avaliacao-texto">
          <p><strong>Aspecto avaliado:</strong> ${av.aspecto}</p>
          <p>${av.comentario}</p>
        </div>

        <div class="avaliacao-footer">
          <span>
            ${av.anonima ? "Avaliação Anônima" : (autor?.nome || "Usuário desconhecido")}
          </span>
          <span>
            ${av.dataLocal || ""}
          </span>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    container.innerHTML = `
      <p style="text-align:center; color:#ff2d6f;">
        Erro ao carregar avaliações.
      </p>
    `;
    console.error(error);
  }
}

carregarAvaliacoes();
