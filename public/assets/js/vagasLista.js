const tbody = document.getElementById('jobListBody');

/* =========================
   CARREGAR VAGAS
========================= */
async function carregarVagas() {
  try {
    const empresaId = Number(localStorage.getItem('idEmpresa'));

    if (!empresaId) {
      alert('Empresa não identificada. Faça login novamente.');
      return;
    }

    const response = await fetch('http://localhost:3000/vagas');
    if (!response.ok) throw new Error();

    const vagas = await response.json();

    const vagasEmpresa = vagas.filter(
      vaga => Number(vaga.empresaId) === empresaId
    );

    tbody.innerHTML = '';

    if (vagasEmpresa.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">
            Nenhuma vaga cadastrada.
          </td>
        </tr>
      `;
      return;
    }

    vagasEmpresa.forEach(vaga => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${vaga.titulo}</td>
        <td>${vaga.descricao}</td>
        <td>${vaga.local}</td>
        <td>${vaga.salario || '-'}</td>
        <td>${vaga.categoria}</td>
        <td>${vaga.tipoContrato}</td>
        <td>
          <button class="btn-edit" onclick="editarVaga('${vaga.id}')">✏️</button>
          <button class="btn-delete" onclick="excluirVaga('${vaga.id}')">🗑️</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    alert('Erro ao carregar vagas.');
  }
}

/* =========================
   EDITAR VAGA (AGORA FUNCIONA)
========================= */
function editarVaga(id) {
  localStorage.setItem('vagaEdicaoId', id);
  window.location.href = 'vagasIndex.html';
}

/* =========================
   EXCLUIR VAGA
========================= */
async function excluirVaga(id) {
  try {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;

    const empresaId = Number(localStorage.getItem('idEmpresa'));

    const response = await fetch(`http://localhost:3000/vagas/${id}`);
    const vaga = await response.json();

    if (vaga.empresaId !== empresaId) {
      alert('Você não tem permissão para excluir esta vaga.');
      return;
    }

    await fetch(`http://localhost:3000/vagas/${id}`, {
      method: 'DELETE'
    });

    alert('Vaga excluída com sucesso!');
    carregarVagas();

  } catch (error) {
    console.error(error);
    alert('Erro ao excluir vaga.');
  }
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', carregarVagas);
