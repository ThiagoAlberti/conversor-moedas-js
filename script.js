const urlBase = 'https://open.er-api.com/v6/latest/';

let taxas = {};
let historico = [];

const moedaBaseSelect = document.getElementById('moedaBase');
const moedaDestinoSelect = document.getElementById('moedaDestino');
const valorInput = document.getElementById('valor');
const resultadoDiv = document.getElementById('resultado');
const historicoTbody = document.querySelector('#historico tbody');
const btnConverter = document.getElementById('btnConverter');
const btnAtualizar = document.getElementById('btnAtualizar');

async function obterTaxas(moedaBase) {
  try {
    const resposta = await fetch(urlBase + moedaBase);
    const dados = await resposta.json();
    if (dados.result === "success") {
      return dados.rates;
    } else {
      alert('Erro na API: ' + (dados['error-type'] || 'Erro desconhecido'));
      return null;
    }
  } catch (e) {
    alert('Erro de conexão: ' + e.message);
    return null;
  }
}

function atualizarMoedasLista(taxas) {
  const moedas = Object.keys(taxas).sort();
  moedaBaseSelect.innerHTML = '';
  moedaDestinoSelect.innerHTML = '';
  moedas.forEach(moeda => {
    const optionBase = document.createElement('option');
    optionBase.value = moeda;
    optionBase.textContent = moeda;
    moedaBaseSelect.appendChild(optionBase);

    const optionDestino = document.createElement('option');
    optionDestino.value = moeda;
    optionDestino.textContent = moeda;
    moedaDestinoSelect.appendChild(optionDestino);
  });
}

function converterMoeda(valor, taxa) {
  return valor * taxa;
}

function atualizarHistorico() {
  historicoTbody.innerHTML = '';
  historico.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.valor}</td><td>${item.de}</td><td>${item.convertido}</td><td>${item.para}</td>`;
    historicoTbody.appendChild(tr);
  });
}

async function atualizarTaxas() {
  const moedaBase = moedaBaseSelect.value || 'USD';
  const novasTaxas = await obterTaxas(moedaBase);
  if (novasTaxas) {
    taxas = novasTaxas;
    atualizarMoedasLista(taxas);
    moedaBaseSelect.value = moedaBase;
    moedaDestinoSelect.value = moedaBase;
    resultadoDiv.textContent = '';
    valorInput.value = '';
    alert('Taxas atualizadas com sucesso!');
  }
}

btnConverter.addEventListener('click', () => {
  const valor = parseFloat(valorInput.value);
  const moedaBase = moedaBaseSelect.value;
  const moedaDestino = moedaDestinoSelect.value;

  if (!valor || valor <= 0) {
    alert('Digite um valor válido maior que zero.');
    return;
  }

  if (!moedaDestino) {
    alert('Selecione a moeda destino.');
    return;
  }

  if (!taxas[moedaDestino]) {
    alert('Taxa para a moeda destino não encontrada.');
    return;
  }

  const convertido = converterMoeda(valor, taxas[moedaDestino]);
  resultadoDiv.textContent = `${valor.toFixed(2)} ${moedaBase} = ${convertido.toFixed(2)} ${moedaDestino}`;

  historico.push({
    valor: valor.toFixed(2),
    de: moedaBase,
    convertido: convertido.toFixed(2),
    para: moedaDestino
  });

  atualizarHistorico();
});

btnAtualizar.addEventListener('click', atualizarTaxas);

// Inicializa o app carregando taxas para USD
window.onload = async () => {
  taxas = await obterTaxas('USD');
  if (taxas) {
    atualizarMoedasLista(taxas);
    moedaBaseSelect.value = 'USD';
    moedaDestinoSelect.value = 'USD';
  } else {
    alert('Erro ao carregar taxas iniciais.');
  }
};
