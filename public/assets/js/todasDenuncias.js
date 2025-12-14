const baseUrl = "http://localhost:3000";

async function carregarTodasDenuncias() {
  const container = document.getElementById("listaTodas");
  container.innerHTML = "<p>Carregando denúncias...</p>";

  try {
    const resDenuncias = await fetch(`${baseUrl}/denuncias?_sort=dataRegistro&_order=desc`);
    const denuncias = await resDenuncias.json();

    const resEmpresas = await fetch(`${baseUrl}/empresas`);
    const empresas = await resEmpresas.json();

    container.innerHTML = "";

    if (!denuncias.length) {
      container.innerHTML = "<p>Nenhuma denúncia registrada.</p>";
      return;
    }

    denuncias.forEach(d => {
      const empresa = empresas.find(e => e.id == d.empresaId);

      const card = document.createElement("div");
      card.className = "card-denuncia";

      card.innerHTML = `
        <div class="card-top">
          <span>${d.anonimo ? "Denúncia Anônima" : "Contato Seguro"}</span>
          <small>${empresa ? empresa.nome : "Empresa não encontrada"}</small>
        </div>

        <div class="card-body-den">
          <p><b>Problema:</b> ${d.titulo}</p>
          <p><b>Descrição:</b> ${d.descricao}</p>
          <p><b>Data:</b> ${new Date(d.dataRegistro).toLocaleString()}</p>

          ${d.nomeDenunciante ? `<p><b>Denunciante:</b> ${d.nomeDenunciante}</p>` : ""}
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Erro ao carregar denúncias:", error);
    container.innerHTML = "<p>Erro ao carregar denúncias.</p>";
  }
}

carregarTodasDenuncias();
