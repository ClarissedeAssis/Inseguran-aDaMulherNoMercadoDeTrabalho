document.addEventListener('DOMContentLoaded', carregarDashboard);

async function carregarDashboard() {
  try {
    const empresaId = localStorage.getItem('idEmpresa');

    if (!empresaId) {
      alert('Empresa não identificada.');
      window.location.href = 'login.html';
      return;
    }

    const baseUrl = 'http://localhost:3000';

    /* =========================
       BUSCAR USUÁRIOS
    ========================= */
    const usersRes = await fetch(`${baseUrl}/usuarios`);
    const usuarios = usersRes.ok ? await usersRes.json() : [];

    const mapaUsuarios = {};
    usuarios.forEach(u => {
      mapaUsuarios[String(u.id)] = u.nome;
    });

    /* =========================
       BUSCAR AVALIAÇÕES E DENÚNCIAS
    ========================= */
    const avalRes = await fetch(`${baseUrl}/avaliacoes?empresaId=${empresaId}`);
    const denRes  = await fetch(`${baseUrl}/denuncias?empresaId=${empresaId}`);

    const avaliacoes = avalRes.ok ? await avalRes.json() : [];
    const denuncias  = denRes.ok  ? await denRes.json()  : [];

    /* =========================
       MÉTRICAS
    ========================= */
    setText('totalAvaliacoes', avaliacoes.length);
    setText('totalDenuncias', denuncias.length);

    /* ===== MÉDIA DAS AVALIAÇÕES (CORRETO) ===== */
    let media = 0;

    if (avaliacoes.length > 0) {
      const soma = avaliacoes.reduce((total, a) => {
        const nota = Number(a.nota);
        return isNaN(nota) ? total : total + nota;
      }, 0);

      media = soma / avaliacoes.length;
    }

    // 🔥 garante 1 casa decimal e valor numérico
    const mediaFormatada = media.toFixed(1);

    setText('avaliacaoMedia', mediaFormatada);

    /* =========================
       GRÁFICO 1 → BARRAS (QUANTIDADES)
    ========================= */
    const ctxQtd = document.getElementById('chartQuantidade');
    if (ctxQtd) {
      if (ctxQtd._chart) ctxQtd._chart.destroy();

      ctxQtd._chart = new Chart(ctxQtd, {
        type: 'bar',
        data: {
          labels: ['Avaliações', 'Denúncias'],
          datasets: [{
            data: [avaliacoes.length, denuncias.length],
            backgroundColor: ['#ff6b81', '#ff4757']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    /* =========================
       GRÁFICO 2 → PIZZA (MÉDIA)
    ========================= */
    const ctxMedia = document.getElementById('chartMedia');
    if (ctxMedia) {
      if (ctxMedia._chart) ctxMedia._chart.destroy();

      ctxMedia._chart = new Chart(ctxMedia, {
        type: 'pie',
        data: {
          labels: ['Média da Empresa', 'Restante até 5'],
          datasets: [{
            data: [media, Math.max(0, 5 - media)],
            backgroundColor: ['#ff4a7a', '#ffe3ec']
          }]
        },
        options: {
          responsive: true
        }
      });
    }

    /* =========================
       AVALIAÇÕES → CARDS
    ========================= */
    const avalContainer = document.getElementById('cardsAvaliacoes');
    avalContainer.innerHTML = '';

    if (avaliacoes.length === 0) {
      avalContainer.innerHTML = '<p>Nenhuma avaliação encontrada.</p>';
    } else {
      avaliacoes.forEach(a => {
        const nomeUsuario = a.anonima
          ? 'Anônimo'
          : (mapaUsuarios[String(a.usuarioId)] || 'Usuário');

        avalContainer.innerHTML += `
          <div class="card-item">
            <div class="card-item-top">
              <span>Avaliação</span>
              <span>Nota: ${a.nota}</span>
            </div>
            <div class="card-item-body">
              <p><strong>Usuário:</strong> ${nomeUsuario}</p>
              <p><strong>Comentário:</strong><br>${a.comentario || 'Sem comentário'}</p>
              <p><strong>Data:</strong> ${formatarData(a.dataLocal)}</p>
            </div>
          </div>
        `;
      });
    }

    /* =========================
       DENÚNCIAS → CARDS
    ========================= */
    const denContainer = document.getElementById('cardsDenuncias');
    denContainer.innerHTML = '';

    if (denuncias.length === 0) {
      denContainer.innerHTML = '<p>Nenhuma denúncia encontrada.</p>';
    } else {
      denuncias.forEach(d => {
        const nomeUsuario = d.anonimo
          ? 'Anônimo'
          : (mapaUsuarios[String(d.usuarioId)] || 'Usuário');

        denContainer.innerHTML += `
          <div class="card-item">
            <div class="card-item-top denuncia">
              <span>${d.titulo}</span>
              <span>${d.status || 'Em análise'}</span>
            </div>
            <div class="card-item-body">
              <p><strong>Usuário:</strong> ${nomeUsuario}</p>
              <p><strong>Descrição:</strong><br>${d.descricao}</p>
              <p><strong>Data:</strong> ${formatarData(d.dataRegistro)}</p>
            </div>
          </div>
        `;
      });
    }

  } catch (error) {
    console.error('Erro no dashboard:', error);
    alert('Erro ao carregar dashboard.');
  }
}

/* =========================
   HELPERS
========================= */
function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Elemento #${id} não encontrado no HTML`);
    return;
  }
  el.textContent = value;
}

function formatarData(data) {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR');
}
