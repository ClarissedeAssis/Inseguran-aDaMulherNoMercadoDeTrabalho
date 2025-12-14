document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idEmpresa = urlParams.get('idEmpresa');

  if (!idEmpresa) return;

  const apiEmpresas = 'http://localhost:3000/empresas';
  const apiAvaliacoes = 'http://localhost:3000/avaliacoes';
  const apiUsuarios = 'http://localhost:3000/usuarios';

  try {
    // Buscar empresa
    const resEmpresas = await fetch(apiEmpresas);
    const empresas = await resEmpresas.json();
    const empresa = empresas.find(e => e.id == idEmpresa);
    if (!empresa) return;

    // Buscar avaliações e usuários
    const resAvaliacoes = await fetch(apiAvaliacoes);
    const avaliacoes = await resAvaliacoes.json();
    const resUsuarios = await fetch(apiUsuarios);
    const usuarios = await resUsuarios.json();

    const avalsEmpresa = avaliacoes.filter(a => a.empresaId == idEmpresa);
    const quantidade = avalsEmpresa.length;
    const media = quantidade > 0
      ? avalsEmpresa.reduce((acc, a) => acc + Number(a.nota), 0) / quantidade
      : 0;

    // Preencher dados da empresa
    document.getElementById('tituloEmpresa').textContent = empresa.nome;
    document.getElementById('fotoEmpresa').src = empresa.fotoEmpresa || 'assets/images/logo.png';
    document.getElementById('descricaoEmpresa').textContent = empresa.descricao;
    document.getElementById('cnpjEmpresa').textContent = empresa.cnpj;
    document.getElementById('setorEmpresa').textContent = empresa.setor;
    document.getElementById('avaliacaoEmpresa').textContent = media.toFixed(1) + ' / 5';
    document.getElementById('quantidadeAvaliacoes').textContent = quantidade;

    // Renderizar avaliações
    const listaAvaliacoes = document.getElementById('listaAvaliacoes');
    if (quantidade === 0) {
      listaAvaliacoes.innerHTML = '<p>Nenhuma avaliação encontrada.</p>';
    } else {
      listaAvaliacoes.innerHTML = avalsEmpresa.map(a => {
        // Pegar nome do usuário, respeitando anonimato
        const usuarioNome = a.anonima
          ? 'Avaliação Anônima'
          : (usuarios.find(u => u.id == a.usuarioId)?.nome || 'Usuário');

        // Criar estrelas
        const estrelas = Array.from({ length: 5 }, (_, i) =>
          i < Math.round(a.nota) ? '★' : '☆'
        ).join('');

        return `
          <div class="avaliacao-item">
            <p><strong>${usuarioNome}:</strong> ${a.comentario}</p>
            <p class="avaliacao-estrelas">${estrelas} (${a.nota}/5)</p>
          </div>
        `;
      }).join('');
    }

  } catch (err) {
    console.error(err);
    document.getElementById('listaAvaliacoes').innerHTML = '<p style="color:red;">Erro ao carregar avaliações.</p>';
  }
});

// Botão voltar
function voltarHome() {
  window.location.href = 'ranking.html'; // ou 'homepage.html' conforme sua estrutura
}
