'use strict';

/**
 * O relogio: passo fixo para a simulacao, quadro livre para o desenho.
 *
 * Sao dois tempos diferentes de proposito.
 *
 * O desenho acontece quando o navegador deixa -- 60 vezes por segundo, ou 30
 * numa maquina cansada, ou nenhuma vez com a aba escondida. A simulacao NAO
 * pode depender disso: com passo variavel, uma colonia num computador rapido
 * avanca diferente da mesma colonia num lento, e a medida de uma maquina deixa
 * de valer na outra.
 *
 * A saida e o acumulador: o tempo real que passou vai para uma conta, e dela
 * saem quantos passos fixos couberam. Um quadro lento vira dois ou tres passos;
 * um rapido, as vezes nenhum.
 *
 * O teto de passos por quadro existe pela "espiral da morte": se a simulacao
 * demora mais que o passo, cada quadro pede mais passos, que demoram mais, que
 * pedem mais. Com teto, a simulacao simplesmente fica em camera lenta -- feio, e
 * melhor que travar.
 */

const PASSO = 1 / 30;
const MAXIMO_POR_QUADRO = 5;

class Relogio {

  constructor() {
    this.acumulado = 0;
    this.anterior = 0;
    this.velocidade = 1;
  }

  /** Quantos passos fixos devem rodar agora. */
  passos(agora) {
    if (this.anterior === 0) {
      this.anterior = agora;

      return 0;
    }

    // O teto de meio segundo cobre o caso da aba escondida: ao voltar, o
    // navegador informa um salto enorme, e sem teto a simulacao tentaria
    // alcancar minutos de uma vez.
    const passou = Math.min(0.5, (agora - this.anterior) / 1000);

    this.anterior = agora;
    this.acumulado += passou * this.velocidade;

    let quantos = 0;

    while (this.acumulado >= PASSO && quantos < MAXIMO_POR_QUADRO) {
      this.acumulado -= PASSO;
      quantos += 1;
    }

    if (quantos >= MAXIMO_POR_QUADRO) {
      // Nao adianta acumular o que nao vai ser rodado: isso so faria a divida
      // crescer para sempre.
      this.acumulado = 0;
    }

    return quantos;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Relogio, PASSO, MAXIMO_POR_QUADRO };
}
