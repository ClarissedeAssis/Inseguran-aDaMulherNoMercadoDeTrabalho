const form = document.getElementById('jobForm');
const reqInput = document.getElementById('requirementInput');
const reqButton = document.getElementById('reqsButton');
const requisitosList = document.getElementById('requirementsList');

const vagaEdicaoId = localStorage.getItem('vagaEdicaoId');

/* =========================
   FUNÇÃO CORRETA PARA SALÁRIO
========================= */
function preencherSalario(salario) {
  if (!salario) return;

  // remove tudo que não for número ou hífen
  const limpo = salario.replace(/[^\d\-]/g, '');

  if (limpo.includes('-')) {
    const [min, max] = limpo.split('-');
    document.getElementById('SalaryMin').value = min || '';
    document.getElementById('SalaryMax').value = max || '';
  }
}

/* =========================
   ADICIONAR REQUISITO
========================= */
function addRequirementToList(text) {
  const li = document.createElement('li');
  li.textContent = text;

  const removeBtn = document.createElement('span');
  removeBtn.textContent = '✖';
  removeBtn.classList.add('remove-req');
  removeBtn.onclick = () => li.remove();

  li.appendChild(removeBtn);
  requisitosList.appendChild(li);
}

reqButton.addEventListener('click', () => {
  const text = reqInput.value.trim();
  if (text) {
    addRequirementToList(text);
    reqInput.value = '';
  }
});

/* =========================
   PEGAR REQUISITOS
========================= */
function getRequirements() {
  return Array.from(requisitosList.querySelectorAll('li')).map(li =>
    li.firstChild.textContent.trim()
  );
}

/* =========================
   CARREGAR VAGA PARA EDIÇÃO
========================= */
async function carregarVagaParaEdicao() {
  if (!vagaEdicaoId) return;

  try {
    const response = await fetch(`http://localhost:3000/vagas/${vagaEdicaoId}`);
    if (!response.ok) throw new Error();

    const vaga = await response.json();

    document.getElementById('Title').value = vaga.titulo;
    document.getElementById('Description').value = vaga.descricao;
    document.getElementById('Location').value = vaga.local;
    document.getElementById('CategoriaSelect').value = vaga.categoria;
    document.getElementById('TipoContratoSelect').value = vaga.tipoContrato;

    // ✅ USO CORRETO DA FUNÇÃO
    preencherSalario(vaga.salario);

    // Requisitos
    if (Array.isArray(vaga.requisitos)) {
      vaga.requisitos.forEach(addRequirementToList);
    }

  } catch (error) {
    console.error('Erro ao carregar vaga:', error);
    alert('Erro ao carregar dados da vaga.');
  }
}

/* =========================
   SUBMIT (CADASTRAR / EDITAR)
========================= */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const empresaId = Number(localStorage.getItem('idEmpresa'));
  if (!empresaId) {
    alert('Empresa não identificada.');
    return;
  }

  const titulo = document.getElementById('Title').value.trim();
  const descricao = document.getElementById('Description').value.trim();
  const local = document.getElementById('Location').value.trim();
  const categoria = document.getElementById('CategoriaSelect').value;
  const tipoContrato = document.getElementById('TipoContratoSelect').value;
  const salarioMin = document.getElementById('SalaryMin').value.trim();
  const salarioMax = document.getElementById('SalaryMax').value.trim();
  const requisitos = getRequirements();

  // 🚫 BLOQUEIA SALVAR SEM CAMPOS
  if (
    !titulo ||
    !descricao ||
    !local ||
    !categoria ||
    !tipoContrato ||
    !salarioMin ||
    !salarioMax ||
    requisitos.length === 0
  ) {
    alert('Preencha todos os campos, incluindo salário e requisitos.');
    return;
  }

  if (Number(salarioMin) >= Number(salarioMax)) {
    alert('Salário mínimo deve ser menor que o máximo.');
    return;
  }

  const vaga = {
    titulo,
    descricao,
    local,
    categoria,
    tipoContrato,
    salario: `${salarioMin}-${salarioMax}`,
    requisitos,
    empresaId,
    dataPublicacao: new Date().toISOString(),
    status: 'ativa'
  };

  try {
    const url = vagaEdicaoId
      ? `http://localhost:3000/vagas/${vagaEdicaoId}`
      : 'http://localhost:3000/vagas';

    const method = vagaEdicaoId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vaga)
    });

    if (!response.ok) throw new Error();

    localStorage.removeItem('vagaEdicaoId');
    window.location.href = 'vagasLista.html';

  } catch (error) {
    console.error('Erro ao salvar vaga:', error);
    alert('Erro ao salvar vaga.');
  }
});

/* =========================
   MÁSCARA → SÓ NÚMEROS
========================= */
function somenteNumeros(input) {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '');
  });
}

somenteNumeros(document.getElementById('SalaryMin'));
somenteNumeros(document.getElementById('SalaryMax'));

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', carregarVagaParaEdicao);
