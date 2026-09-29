'use strict';

/**
 * O mundo, em celulas.
 *
 * As formigas andam em coordenadas continuas -- elas tem angulo e velocidade --,
 * mas o feromonio mora numa grade. E a divisao que faz a simulacao caber num
 * navegador: um campo de cheiro continuo exigiria uma equacao diferencial por
 * quadro, e uma grade de 160 por 90 e um vetor de 14 mil numeros que o
 * computador varre sem suar.
 *
 * A celula tem oito pixels de lado. Menor que isso, a trilha fica com cara de
 * ruido e a varredura comeca a pesar; maior, a formiga nao consegue distinguir
 * dois caminhos vizinhos e a colonia deixa de achar atalhos.
 */

const LADO_DA_CELULA = 8;

class Grade {

  constructor(largura, altura) {
    this.largura = largura;
    this.altura = altura;

    this.colunas = Math.ceil(largura / LADO_DA_CELULA);
    this.linhas = Math.ceil(altura / LADO_DA_CELULA);

    this.quantas = this.colunas * this.linhas;
  }

  /** O indice da celula que contem um ponto, ou -1 se ele esta fora. */
  indiceEm(x, y) {
    if (x < 0 || y < 0 || x >= this.largura || y >= this.altura) {
      return -1;
    }

    const coluna = Math.floor(x / LADO_DA_CELULA);
    const linha = Math.floor(y / LADO_DA_CELULA);

    return linha * this.colunas + coluna;
  }

  /** O centro de uma celula, em pixels. */
  centroDe(indice) {
    const coluna = indice % this.colunas;
    const linha = Math.floor(indice / this.colunas);

    return {
      x: coluna * LADO_DA_CELULA + LADO_DA_CELULA / 2,
      y: linha * LADO_DA_CELULA + LADO_DA_CELULA / 2,
    };
  }

  dentro(x, y) {
    return x >= 0 && y >= 0 && x < this.largura && y < this.altura;
  }

  /** Um vetor de zeros do tamanho da grade. */
  vetorNovo() {
    return new Float32Array(this.quantas);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Grade, LADO_DA_CELULA };
}
