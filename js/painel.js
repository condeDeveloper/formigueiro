'use strict';

/**
 * O painel: os numeros e os botoes.
 *
 * Os numeros sao os mesmos que a ferramenta de medida imprime, e isso e
 * proposito: quem olha a tela e quem roda `npm run medir` estao vendo a mesma
 * simulacao pelos mesmos indicadores. Um painel com numeros diferentes dos da
 * medida seria um painel decorativo.
 */

class Painel {

  constructor(raiz) {
    this.raiz = raiz;

    this.campos = {};

    for (const campo of raiz.querySelectorAll('[data-campo]')) {
      this.campos[campo.dataset.campo] = campo;
    }
  }

  mostrar(colonia, minimo) {
    const cenario = colonia.cenario;

    this.escrever('tempo', formatarTempo(colonia.tempo));
    this.escrever('entregues', cenario.colhidas);
    this.escrever('restante', cenario.comidaRestante);
    this.escrever('carregando', `${colonia.carregando} de ${colonia.formigas.length}`);
    this.escrever('ritmo', `${colonia.ritmo().toFixed(0)} por minuto`);

    const caminho = colonia.caminhoMedio();

    this.escrever('caminho', caminho > 0 ? `${caminho.toFixed(0)} px` : '--');
    this.escrever('eficiencia', caminho > 0
      ? `${(caminho / minimo).toFixed(2)}x o minimo`
      : '--');
  }

  escrever(campo, valor) {
    const onde = this.campos[campo];

    if (onde && onde.textContent !== String(valor)) {
      onde.textContent = valor;
    }
  }
}

function formatarTempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);

  return `${minutos}:${String(resto).padStart(2, '0')}`;
}

if (typeof module !== 'undefined') {
  module.exports = { Painel, formatarTempo };
}
