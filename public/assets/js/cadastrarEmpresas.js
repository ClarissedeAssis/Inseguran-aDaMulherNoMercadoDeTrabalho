const form = document.getElementById('formEmpresa');
const cnpjInput = document.getElementById('cnpj');
const cepInput = document.getElementById('cep');
const fotoInput = document.getElementById('fotoEmpresa');
const previewLogo = document.getElementById('previewLogo');


cnpjInput.addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 14) value = value.slice(0, 14);
  value = value.replace(/^(\d{2})(\d)/, '$1.$2');
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
  value = value.replace(/(\d{4})(\d)/, '$1-$2');
  e.target.value = value;
});


cepInput.addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 8) value = value.slice(0, 8);
  if (value.length > 5) {
    value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
  }
  e.target.value = value;
});


fotoInput.addEventListener('change', function () {
  const file = this.files[0];
  const label = document.getElementById('fileLabel');
  if (file) {
    previewLogo.src = URL.createObjectURL(file);
    previewLogo.style.display = 'block';
    label.textContent = file.name;
  } else {
    previewLogo.style.display = 'none';
    label.textContent = 'Clique ou arraste a imagem';
  }
});

function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  return cnpj.length === 14;
}

function validarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  return cep.length === 8;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Submissão do formulário
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const file = document.getElementById('fotoEmpresa').files[0];
  const cnpj = document.getElementById('cnpj').value.trim();
  const endereco = document.getElementById('endereco').value.trim();
  const cep = document.getElementById('cep').value.trim();
  const setor = document.getElementById('setor').value;
  const descricao = document.getElementById('descricao').value.trim();

  // Validações simples
  if (!nome) return alert('Preencha o nome da empresa');
  if (!email) return alert('Preencha o e-mail da empresa');
  if (!validarEmail(email)) return alert('Digite um e-mail válido');
  if (!file) return alert('Envie a logo da empresa');
  if (!validarCNPJ(cnpj)) return alert('CNPJ inválido. Deve conter 14 números.');
  if (!endereco) return alert('Preencha o endereço');
  if (!validarCEP(cep)) return alert('CEP inválido. Deve conter 8 números.');
  if (!setor) return alert('Selecione o setor');
  if (!descricao) return alert('Preencha a descrição');

  const reader = new FileReader();

  reader.onload = function () {
    const fotoBase64 = reader.result;

    fetch('http://localhost:3000/empresas')
      .then(res => res.json())
      .then(empresas => {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        const existeCNPJ = empresas.some(e => e.cnpj.replace(/\D/g, '') === cnpjLimpo);
        const existeEmail = empresas.some(e => e.email.toLowerCase() === email.toLowerCase());

        if (existeCNPJ) {
          alert('Já existe uma empresa cadastrada com este CNPJ.');
          throw new Error('CNPJ duplicado');
        }
        if (existeEmail) {
          alert('Já existe uma empresa cadastrada com este e-mail.');
          throw new Error('E-mail duplicado');
        }

        const maxId = empresas.length ? Math.max(...empresas.map(e => Number(e.id))) : 0;
        const novaEmpresa = {
          id: String(maxId + 1),
          nome,
          email,
          fotoEmpresa: fotoBase64,
          cnpj,
          endereco,
          cep,
          setor,
          descricao,
          avaliacaoTotal: 0,
          quantidadeAvaliacoes: 0,
          quantidadeDenuncias: 0
        };

        return fetch('http://localhost:3000/empresas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novaEmpresa)
        });
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao cadastrar a empresa.');
        }
        return response.json();
      })
      .then(data => {
        alert('Empresa cadastrada com sucesso! Redirecionando para o cadastro do primeiro usuário...');

        // Limpa os campos
        form.reset();
        previewLogo.style.display = 'none';
        previewLogo.src = '';
        document.getElementById('uploadIcon').style.display = 'block';
        document.getElementById('fileLabel').textContent = 'Clique ou arraste a imagem';

        // Redireciona para o cadastro de usuário da empresa com o id
        setTimeout(() => {
         window.location.href = `cadastroUsuarioEmpresa.html?idEmpresa=${data.id}`;
        }, 1500);
      })
      .catch(err => console.error(err));
  };

  reader.readAsDataURL(file);
});
