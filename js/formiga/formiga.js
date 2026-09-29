'use strict';

/**
 * Uma formiga: posicao, angulo, e se esta carregando comida.
 *
 * O estado cabe em cinco numeros e um booleano, de proposito. Toda vez que eu
 * quis acrescentar memoria aqui -- "lembrar de onde veio", "guardar o caminho"
 * --, a simulacao ficou pior: as formigas passaram a resolver o problema
 * sozinhas e a trilha coletiva deixou de aparecer. O interessante desta
 * simulacao esta no que a formiga NAO sabe.
 */

const VELOCIDADE = 46;

/** Quanto o angulo pode virar por segundo. */
const GIRO_MAXIMO = 7.5;

/** Quanto cheiro cada formiga deposita por segundo. */
const DEPOSITO_POR_SEGUNDO = 22;

/**
 * Quanto tempo o deposito dura depois de sair do ninho ou da comida.
 *
 * E o detalhe que faz as trilhas ficarem curtas. Uma formiga que deposita para
 * sempre marca tambem o trecho em que estava perdida, e a trilha herda a volta
 * inteira. Com o deposito minguando, o cheiro forte fica perto do destino e vai
 * enfraquecendo conforme a formiga se afasta dele -- entao um caminho curto
 * chega com mais cheiro sobrando que um longo, e ganha.
 */
const FOLEGO = 26;

class Formiga {

  constructor(x, y, angulo, sorteio) {
    this.x = x;
    this.y = y;
    this.angulo = angulo;

    this.carregando = false;
    this.folego = FOLEGO;

    this.sorteio = sorteio;

    // Quanto andou desde que saiu do ninho ou da comida. E so para as medidas:
    // nenhuma decisao olha para este numero.
    this.andou = 0;
  }

  get qualDeposita() {
    // Quem volta com comida marca "aqui tem comida", porque VEIO de la. A
    // informacao anda ao contrario da formiga.
    return this.carregando ? 'comida' : 'casa';
  }

  get qualProcura() {
    return this.carregando ? 'casa' : 'comida';
  }

  virarPara(direcao, segundos) {
    let diferenca = direcao - this.angulo;

    while (diferenca > Math.PI) {
      diferenca -= Math.PI * 2;
    }

    while (diferenca < -Math.PI) {
      diferenca += Math.PI * 2;
    }

    const teto = GIRO_MAXIMO * segundos;

    this.angulo += Math.max(-teto, Math.min(teto, diferenca));
  }

  andar(segundos) {
    const distancia = VELOCIDADE * segundos;

    this.x += Math.cos(this.angulo) * distancia;
    this.y += Math.sin(this.angulo) * distancia;

    this.andou += distancia;
  }

  /**
   * Recomeca o folego. Chamado ao pegar comida e ao entregar.
   *
   * A conta de distancia NAO zera aqui: ela vale do ninho ate o ninho, ida e
   * volta, porque e esse o numero que se compara com a geometria. Zerar ao
   * pegar a comida mede so a perna de volta, e ai o resultado da "0,95 vezes o
   * minimo" -- um numero impossivel, que foi como eu descobri o engano.
   */
  recomecarFolego() {
    this.folego = FOLEGO;
  }

  /** Zera a conta de distancia. So ao entregar. */
  recomecarConta() {
    this.andou = 0;
  }

  /** O quanto ela deposita agora, ja com o folego descontado. */
  quantoDeposita(segundos) {
    const fracao = Math.max(0, this.folego) / FOLEGO;

    return DEPOSITO_POR_SEGUNDO * segundos * fracao * fracao;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Formiga, VELOCIDADE, GIRO_MAXIMO, DEPOSITO_POR_SEGUNDO, FOLEGO };
}
