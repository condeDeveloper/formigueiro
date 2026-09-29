'use strict';

/**
 * Um sorteio com semente, e nao o Math.random.
 *
 * Parece detalhe e e a decisao que torna este projeto mensuravel. Uma simulacao
 * com Math.random da um resultado diferente a cada vez que roda, e ai nao ha
 * como dizer se uma mudanca no codigo melhorou alguma coisa ou se foi sorte.
 *
 * Com semente, a mesma semente da exatamente a mesma simulacao -- as mesmas
 * formigas indo para os mesmos lugares, na mesma ordem. As ferramentas de
 * medida rodam dez sementes diferentes e comparam medias, que e o unico jeito
 * honesto de falar de um sistema em que tudo e probabilistico.
 *
 * O algoritmo e o mulberry32: trinta e duas linhas de nada, periodo de 2^32,
 * e o suficiente para formigas. Nao serve para criptografia e nao esta aqui
 * para isso.
 */

class Aleatorio {

  constructor(semente) {
    this.estado = semente >>> 0;
  }

  /** Um numero em [0, 1). */
  numero() {
    this.estado = (this.estado + 0x6D2B79F5) >>> 0;

    let t = this.estado;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Um numero em [de, ate). */
  entre(de, ate) {
    return de + this.numero() * (ate - de);
  }

  /** Um inteiro em [0, quantos). */
  ate(quantos) {
    return Math.floor(this.numero() * quantos);
  }

  /** Verdadeiro com a probabilidade dada. */
  chance(probabilidade) {
    return this.numero() < probabilidade;
  }

  /**
   * Escolhe um indice com probabilidade proporcional ao peso.
   *
   * E a operacao mais importante do projeto inteiro: e por ela que uma formiga
   * segue o feromonio sem obedecer cegamente a ele. Um caminho com o dobro de
   * cheiro tem o dobro de chance, e nao a certeza -- e e essa folga que permite
   * a colonia achar um atalho depois de ja ter uma trilha boa.
   */
  peloPeso(pesos) {
    let total = 0;

    for (const peso of pesos) {
      total += peso;
    }

    if (total <= 0) {
      return this.ate(pesos.length);
    }

    let alvo = this.numero() * total;

    for (let i = 0; i < pesos.length; i += 1) {
      alvo -= pesos[i];

      if (alvo <= 0) {
        return i;
      }
    }

    return pesos.length - 1;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Aleatorio };
}
