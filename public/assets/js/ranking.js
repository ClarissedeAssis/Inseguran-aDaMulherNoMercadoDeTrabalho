document.addEventListener('DOMContentLoaded', () => {
  const apiEmpresas = 'http://localhost:3000/empresas';
  const apiAvaliacoes = 'http://localhost:3000/avaliacoes';
  const lista = document.getElementById('ranking-lista');
  const buscarInput = document.getElementById('buscar');

  // Carregar ranking
  async function carregarRanking() {
    try {
      const resEmpresas = await fetch(apiEmpresas);
      const empresas = await resEmpresas.json();

      // Carrega também todas as avaliações
      const resAvaliacoes = await fetch(apiAvaliacoes);
      const avaliacoes = await resAvaliacoes.json();

      renderRanking(empresas, avaliacoes);

      buscarInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtradas = empresas.filter(emp =>
          emp.nome.toLowerCase().includes(termo) ||
          emp.cnpj.toLowerCase().includes(termo) ||
          emp.setor.toLowerCase().includes(termo)
        );
        renderRanking(filtradas, avaliacoes);
      });

    } catch (err) {
      console.error(err);
      lista.innerHTML = '<p style="color:#900">Erro ao carregar ranking.</p>';
    }
  }

  // Renderiza o ranking
  async function renderRanking(empresas, avaliacoes) {
    lista.innerHTML = '';

    if (!empresas || empresas.length === 0) {
      lista.innerHTML = '<p>Nenhuma empresa encontrada.</p>';
      return;
    }

    // Ordena empresas pela média das avaliações (calculada agora)
    const ranking = empresas.sort((a, b) => {
      const mediaA = calcularMedia(a.id, avaliacoes);
      const mediaB = calcularMedia(b.id, avaliacoes);
      return mediaB - mediaA;
    });

    ranking.forEach(emp => {
      const card = document.createElement('div');
      card.classList.add('ranking-item');

      const foto = emp.fotoEmpresa && emp.fotoEmpresa.trim() !== ""
        ? emp.fotoEmpresa
        : "assets/images/logo.png";

      const media = calcularMedia(emp.id, avaliacoes);
      const quantidade = avaliacoes.filter(a => a.empresaId == emp.id).length;

      const estrelas = Array.from({ length: 5 }, (_, i) =>
        `<i class="bi ${i < Math.round(media) ? 'bi-star-fill' : 'bi-star'}"></i>`
      ).join('');

      const seloPremium = media >= 4.5
        ? `<span class="selo-premium" style="margin-left:6px; color:#ff6b81; font-weight:700;">⭐ Empresa Segura</span>`
        : '';

      card.innerHTML = `
        <img src="${foto}" alt="${emp.nome}" class="ranking-foto"
             onerror="this.onerror=null; this.src='assets/images/logo.png'">
        <div class="ranking-info">
          <h3>${emp.nome} ${seloPremium}</h3>
          <div class="ranking-meta">${emp.cnpj} • ${emp.setor}</div>
          <div class="ranking-desc">${emp.descricao}</div>
          <div class="avaliacao-container">
            ${estrelas}
            <span>${media.toFixed(1)} / 5 (${quantidade} avaliações)</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `detalhesEmpresa.html?idEmpresa=${emp.id}`;
      });

      lista.appendChild(card);
    });
  }

  // Função para calcular a média das avaliações de uma empresa
  function calcularMedia(empresaId, avaliacoes) {
    const avals = avaliacoes.filter(a => a.empresaId == empresaId);
    if (avals.length === 0) return 0;
    const soma = avals.reduce((acc, a) => acc + Number(a.nota), 0);
    return soma / avals.length;
  }

  carregarRanking();
});
function voltarHome() {
  window.location.href = "homepage.html";
}
