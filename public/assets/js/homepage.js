const API = "http://localhost:3000";

async function carregarRanking() {
  try {
    const res = await fetch(`${API}/empresas`);
    const empresas = await res.json();

    if (empresas.length > 0) {

      // Ordena corretamente do maior para o menor
      const ordenadas = empresas.sort((a, b) => b.avaliacaoTotal - a.avaliacaoTotal);
      const melhor = ordenadas[0];

      document.getElementById("rankingDesc").innerHTML = `
        ⭐ <strong>${melhor.nome}</strong><br>
        📈 Nota Geral: ${melhor.avaliacaoTotal}<br>
        🧭 Área: ${melhor.setor || "Não informado"}<br>
        📝 Descrição: ${melhor.descricao || "Sem detalhes cadastrados."}
      `;
    } else {
      document.getElementById("rankingDesc").innerText =
        "Nenhuma empresa encontrada.";
    }

  } catch (err) {
    console.error("Erro ranking:", err);
    document.getElementById("rankingDesc").innerText =
      "Erro ao carregar ranking.";
  }
}

async function carregarVaga() {
  try {
    const res = await fetch(`${API}/vagas`);
    const vagas = await res.json();

    if (vagas.length > 0) {
      const ultima = vagas[vagas.length - 1]; 

      const empresa = await fetch(`${API}/empresas/${ultima.empresaId}`)
        .then(r => r.json());

      document.getElementById("vagaDesc").innerHTML = `
        📌 <strong>${ultima.titulo}</strong><br>
        🏢 Empresa: ${empresa.nome}<br>
        💼 Tipo: ${ultima.tipo || "Não informado"}<br>
        📍 Local: ${ultima.local || "Não informado"}<br>
        📝 ${ultima.descricao}
      `;
    } else {
      document.getElementById("vagaDesc").innerText = "Nenhuma vaga encontrada.";
    }

  } catch (err) {
    console.error("Erro vaga:", err);
    document.getElementById("vagaDesc").innerText =
      "Erro ao carregar vaga.";
  }
}

async function carregarDenuncia() {
  try {
    const res = await fetch(`${API}/denuncias`);
    const denuncias = await res.json();

    if (denuncias.length > 0) {
      const ultima = denuncias[denuncias.length - 1]; // última denúncia cadastrada

      const empresa = await fetch(`${API}/empresas/${ultima.empresaId}`)
        .then(r => r.json());

      document.getElementById("denunciaDesc").innerHTML = `
        🚨 <strong>${ultima.titulo}</strong><br>
        🏢 Empresa citada: ${empresa.nome}<br>
        📄 ${ultima.descricao}
      `;
    } else {
      document.getElementById("denunciaDesc").innerText =
        "Nenhuma denúncia encontrada.";
    }

  } catch (err) {
    console.error("Erro denúncia:", err);
    document.getElementById("denunciaDesc").innerText =
      "Erro ao carregar denúncia.";
  }
}

carregarRanking();
carregarVaga();
carregarDenuncia();