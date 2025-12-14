// visualizarEmpresas.js (versão robusta)
document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = 'http://localhost:3000/empresas';
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const txtBusca = document.getElementById('txtBusca');
  const btnLimpar = document.getElementById('btnLimpar'); // pode ser null

  if (!grid) {
    console.error('visualizarEmpresas.js: elemento #grid não existe no HTML.');
    return;
  }
  if (!empty) {
    console.warn('visualizarEmpresas.js: elemento #empty não encontrado — criando mensagem padrão.');
  }

  let empresasCache = [];

  async function carregarEmpresas() {
    try {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'none';
      console.log('Buscando empresas em', apiUrl);
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Resposta do servidor: ' + res.status);
      const data = await res.json();
      empresasCache = Array.isArray(data) ? data : [];
      renderEmpresas(empresasCache);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      if (empty) {
        empty.style.display = 'block';
        empty.textContent = 'Erro ao carregar empresas. Verifique o servidor (console para mais detalhes).';
      } else {
        grid.innerHTML = '<p style="color:#900">Erro ao carregar empresas. Veja console.</p>';
      }
    }
  }

  function formatCNPJ(cnpjRaw) {
    if (!cnpjRaw) return '';
    const v = cnpjRaw.replace(/\D/g, '');
    if (v.length !== 14) return cnpjRaw;
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

function renderEmpresas(list) {
  grid.innerHTML = '';
  if (!list || list.length === 0) {
    if (empty) {
      empty.style.display = 'block';
      empty.textContent = 'Nenhuma empresa encontrada.';
    } else {
      grid.innerHTML = '<p>Nenhuma empresa encontrada.</p>';
    }
    return;
  }

  if (empty) empty.style.display = 'none';

  list.forEach(emp => {
    const card = document.createElement('div');
    card.className = 'empresa-card';

    const nome = emp.nome || '—';
    const cnpj = formatCNPJ(emp.cnpj || '');
    const setor = emp.setor || '—';
    const descricao = emp.descricao || '';
    const avaliacao = emp.avaliacaoTotal ?? 0; // valor numérico
    const qtdAvaliacoes = emp.quantidadeAvaliacoes ?? 0;
    const foto = emp.fotoEmpresa || ''; // Base64 da foto

    // Função para gerar estrelas conforme a nota
    const estrelas = Array.from({ length: 5 }, (_, i) => {
      const estrelaCheia = i < avaliacao;
      return `<i class="bi ${estrelaCheia ? 'bi-star-fill' : 'bi-star'} estrela"></i>`;
    }).join('');

    card.innerHTML = `
      <div class="empresa-card-top">
        ${foto ? `<img src="${foto}" alt="Logo de ${escapeHtml(nome)}" class="empresa-logo"/>` : ''}
        <div class="empresa-info">
          <h5>${escapeHtml(nome)}</h5>
          <div class="empresa-meta">${escapeHtml(cnpj)} • ${escapeHtml(setor)}</div>
        </div>
      </div>
      <div class="empresa-desc">${escapeHtml(descricao)}</div>
      <div class="card-footer-actions">
        <div class="avaliacao-container">
          ${estrelas}
          <small class="text-muted">(${qtdAvaliacoes} avaliações)</small>
        </div>
      </div>
    `;

   card.addEventListener("click", () => {
      window.location.href = `detalhesEmpresa.html?id=${emp.id}`;
    });
    grid.appendChild(card);
  });

}
  function filtrarEmpresas(list, termo) {
    const t = (termo || '').toLowerCase().trim();
    if (!t) return list;
    return list.filter(emp => {
      const nome = (emp.nome || '').toLowerCase();
      const cnpj = (emp.cnpj || '').toLowerCase();
      const setor = (emp.setor || '').toLowerCase();
      return nome.includes(t) || cnpj.includes(t) || setor.includes(t);
    });
  }

 
  if (txtBusca) {
    txtBusca.addEventListener('input', () => {
      const filtradas = filtrarEmpresas(empresasCache, txtBusca.value);
      renderEmpresas(filtradas);
    });
  } else {
    console.warn('visualizarEmpresas.js: input #txtBusca não encontrado — pesquisa desabilitada.');
  }

 
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      if (txtBusca) txtBusca.value = '';
      renderEmpresas(empresasCache);
    });
  } else {
    
    console.info('visualizarEmpresas.js: botão #btnLimpar não existe (ok).');
  }

  
  carregarEmpresas();
});
