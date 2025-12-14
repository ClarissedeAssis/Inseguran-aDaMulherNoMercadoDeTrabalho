const API = 'http://localhost:3000/curriculo';

const params = new URLSearchParams(window.location.search);
const vagaId = params.get("vagaId");

const formCurriculo = document.getElementById("formCurriculo");
const preview = document.getElementById("preview");
const btnEnviar = document.getElementById("btnEnviar");

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const contato = document.getElementById("contato");
const areaAtuacao = document.getElementById("areaAtuacao");
const formacao = document.getElementById("formacao");
const habilidades = document.getElementById("habilidades");
const objetivo = document.getElementById("objetivo");
const experiencia = document.getElementById("experiencia");

function montarObjeto() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  return {
    vagaId: vagaId,
    userId: usuarioLogado?.id, // ✅ AGORA PEGA O ID CORRETO
    nome: nome.value,
    email: email.value,
    contato: contato.value,
    areaAtuacao: areaAtuacao.value,
    formacao: formacao.value,
    habilidades: habilidades.value
      .split(',')
      .map(h => h.trim())
      .filter(Boolean),
    objetivo: objetivo.value,
    experiencia: experiencia.value,
    statusEnvio: "enviado"
  };
}

async function enviarCurriculo() {
  const obj = montarObjeto();

  if (!obj.nome || !obj.email || !obj.contato) {
    alert("Preencha nome, e-mail e contato.");
    return;
  }

  if (!obj.userId) {
    alert("Usuário não identificado. Faça login novamente.");
    return;
  }

  try {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    });

    alert("Currículo enviado com sucesso!");
    formCurriculo.reset();
    atualizarPreview();
  } catch {
    alert("Erro ao enviar currículo.");
  }
}

function atualizarPreview() {
  const obj = montarObjeto();

  preview.innerHTML = `
    <h3>Prévia do currículo</h3>
    <p><b>Nome:</b> ${obj.nome || '—'}</p>
    <p><b>E-mail:</b> ${obj.email || '—'}</p>
    <p><b>Contato:</b> ${obj.contato || '—'}</p>
    <p><b>Área:</b> ${obj.areaAtuacao || '—'}</p>
    <p><b>Formação:</b> ${obj.formacao || '—'}</p>
    <p><b>Habilidades:</b> ${obj.habilidades.join(', ') || '—'}</p>
    <p><b>Objetivo:</b> ${obj.objetivo || '—'}</p>
    <p><b>Experiência:</b> ${obj.experiencia || '—'}</p>
  `;
}

btnEnviar.onclick = enviarCurriculo;

[
  nome, email, contato, areaAtuacao,
  formacao, habilidades, objetivo, experiencia
].forEach(campo =>
  campo.addEventListener('input', atualizarPreview)
);

window.onload = atualizarPreview;
