const baseUrl = "http://localhost:3000";

const cnpjInput = document.getElementById("cnpj");
const btnBuscar = document.getElementById("btnBuscar");
const empresaNomeInput = document.getElementById("empresaNome");
const denunciaForm = document.getElementById("denunciaForm");
const campoNome = document.getElementById("campoNome");
let empresaSelecionada = null;

/* --------- MÁSCARA CNPJ --------- */
function aplicarMascaraCNPJ(v){
  v = v.replace(/\D/g,"").slice(0,14);
  v = v.replace(/^(\d{2})(\d)/,"$1.$2");
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3");
  v = v.replace(/\.(\d{3})(\d)/,".$1/$2");
  v = v.replace(/(\d{4})(\d)/,"$1-$2");
  return v;
}
cnpjInput.addEventListener("input",()=>cnpjInput.value=aplicarMascaraCNPJ(cnpjInput.value));

/* --------- BUSCAR EMPRESA --------- */
btnBuscar.addEventListener("click", async ()=>{
  const raw = cnpjInput.value.replace(/\D/g,"");

  const res = await fetch(`${baseUrl}/empresas`);
  const empresas = await res.json();

  const encontrada = empresas.find(e => e.cnpj.replace(/\D/g,"") === raw);

  if(!encontrada){
    alert("Empresa não encontrada.");
    empresaSelecionada = null;
    empresaNomeInput.value = "";
    return;
  }

  empresaSelecionada = encontrada;
  empresaNomeInput.value = encontrada.nome;
  alert("Empresa encontrada!");
});

/* --------- USUÁRIO LOGADO --------- */
function obterUsuarioLogado(){
  try{
    const u = JSON.parse(localStorage.getItem("usuarioLogado"));
    return u && u.id ? u : null;
  }catch{
    return null;
  }
}

/* --------- MOSTRAR CAMPO DO NOME SE FOR "CONTATO" --------- */
document.querySelectorAll('input[name="tipoDenuncia"]').forEach(radio =>{
  radio.addEventListener("change", ()=>{
    const selecionado = document.querySelector('input[name="tipoDenuncia"]:checked').value;

    if(selecionado === "contato"){
      const u = obterUsuarioLogado();
      if(!u){
        alert("Faça login novamente.");
        return;
      }

      campoNome.style.display="block";
      campoNome.innerHTML = `
        <label>Nome do Denunciante</label>
        <input type="text" readonly value="${u.nome}">
      `;
    } else {
      campoNome.style.display="none";
    }
  });
});

/* --------- ENVIAR DENÚNCIA --------- */
denunciaForm.addEventListener("submit", async (e)=>{
  e.preventDefault();

  if(!empresaSelecionada){
    alert("Busque a empresa antes de enviar.");
    return;
  }

  const u = obterUsuarioLogado();
  if(!u){
    alert("Usuário não logado.");
    return;
  }

  const tipo = document.getElementById("tipoProblema").value;
  const descricao = document.getElementById("descricao").value.trim();
  const dataLocal = document.getElementById("dataLocal").value.trim();
  const tipoDenuncia = document.querySelector('input[name="tipoDenuncia"]:checked').value;

  const fileInput = document.getElementById("evidencia");
  let arquivos = [];

  if(fileInput.files.length > 0){
    const f = fileInput.files[0];

    const base64 = await new Promise(resolve=>{
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(f);
    });

    arquivos.push({ nome: f.name, tipo: f.type, base64 });
  }

  const denuncia = {
    empresaId: empresaSelecionada.id,
    usuarioId: u.id,
    nomeDenunciante: tipoDenuncia === "contato" ? u.nome : null,
    titulo: tipo,
    descricao,
    provas: arquivos,
    anonimo: tipoDenuncia === "anonima",
    dataRegistro: new Date().toISOString(),
    status: "em análise"
  };

  await fetch(`${baseUrl}/denuncias`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(denuncia)
  });

  alert("Denúncia registrada!");

  denunciaForm.reset();
  empresaNomeInput.value = "";
  empresaSelecionada = null;
  campoNome.style.display = "none";

  clearUpload();  // limpa corretamente

  carregarDenuncias();
});

/* --------- CARREGAR LISTA --------- */
async function carregarDenuncias(){
  const lista = document.getElementById("listaDenuncias");
  lista.innerHTML = "";

  const resDenuncias = await fetch(`${baseUrl}/denuncias`);
  let denuncias = await resDenuncias.json();

  const resEmpresas = await fetch(`${baseUrl}/empresas`);
  const empresas = await resEmpresas.json();

  // Ordena corretamente por data mais recente
  denuncias.sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));

  // Agora sim pega as 3 mais recentes DE VERDADE
  const ultimasTres = denuncias.slice(0, 3);

  ultimasTres.forEach(d=>{
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

    lista.appendChild(card);
  });
}

carregarDenuncias();

/* --------- LIMPAR UPLOAD --------- */
function clearUpload() {
  const fileInput = document.getElementById("evidencia");
  const preview = document.getElementById("previewFile");
  const uploadText = document.getElementById("uploadText");

  fileInput.value = "";
  preview.src = "";
  preview.style.display = "none";

  uploadText.innerText = "Clique ou arraste o arquivo";
  uploadText.style.display = "block";
}
