'use strict';

/**
 * O cheiro, e as duas trilhas.
 *
 * Sao DOIS campos, e isso e o centro de tudo. Uma formiga que procura comida
 * segue o cheiro "achei comida"; uma que carrega comida segue o cheiro "por aqui
 * se volta para casa". Com um campo so, a trilha vira um circulo em que as
 * formigas andam para sempre sem chegar a lugar nenhum -- foi a primeira versao
 * aqui, e ela e bonita de ver e completamente inutil.
 *
 * Cada formiga deposita o cheiro do caminho que ACABOU de fazer, e nao o do
 * caminho que quer seguir. Quem vai para casa carregando comida deposita
 * "comida" -- porque veio de la. Quem sai do ninho deposita "casa". A informacao
 * anda ao contrario das formigas, e e isso que faz a trilha apontar para os dois
 * lados ao mesmo tempo.
 *
 * A evaporacao nao e detalhe de realismo: e o unico mecanismo de esquecimento
 * que o sistema tem. Sem ela, a primeira trilha achada -- por pior que seja --
 * fica marcada para sempre e a colonia nunca descobre o atalho.
 */

const EVAPORACAO_POR_SEGUNDO = 0.12;

/** O teto por celula. Sem ele, uma trilha muito usada vira um imã absoluto. */
const TETO = 8;

class Feromonio {

  constructor(grade) {
    this.grade = grade;

    this.deComida = grade.vetorNovo();
    this.deCasa = grade.vetorNovo();

    this.sobra = 0;
  }

  /** Deposita cheiro numa posicao. `qual` e 'comida' ou 'casa'. */
  depositar(x, y, qual, quanto) {
    const indice = this.grade.indiceEm(x, y);

    if (indice < 0) {
      return;
    }

    const campo = qual === 'comida' ? this.deComida : this.deCasa;

    campo[indice] = Math.min(TETO, campo[indice] + quanto);
  }

  ler(indice, qual) {
    if (indice < 0) {
      return 0;
    }

    return qual === 'comida' ? this.deComida[indice] : this.deCasa[indice];
  }

  lerEm(x, y, qual) {
    return this.ler(this.grade.indiceEm(x, y), qual);
  }

  /**
   * Evapora tudo um pouco.
   *
   * A conta e exponencial e nao linear: cada celula perde uma FRACAO do que
   * tem, e nao uma quantidade fixa. Com a subtracao fixa, uma trilha fraca
   * some de uma vez e uma forte demora o mesmo tempo absoluto para sumir --
   * o que da um sistema em que so existem dois estados, cheio e vazio.
   */
  evaporar(segundos) {
    const fator = Math.pow(1 - EVAPORACAO_POR_SEGUNDO, segundos);

    for (let i = 0; i < this.deComida.length; i += 1) {
      this.deComida[i] *= fator;
      this.deCasa[i] *= fator;

      // Abaixo deste piso o valor nao influencia decisao nenhuma e so custa
      // multiplicacao. Zerar limpa a grade e deixa o desenho mais nitido.
      if (this.deComida[i] < 0.002) {
        this.deComida[i] = 0;
      }

      if (this.deCasa[i] < 0.002) {
        this.deCasa[i] = 0;
      }
    }
  }

  /** Quanto cheiro ha no total. Serve para as medidas. */
  total(qual) {
    const campo = qual === 'comida' ? this.deComida : this.deCasa;

    let soma = 0;

    for (let i = 0; i < campo.length; i += 1) {
      soma += campo[i];
    }

    return soma;
  }

  limpar() {
    this.deComida.fill(0);
    this.deCasa.fill(0);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Feromonio, EVAPORACAO_POR_SEGUNDO, TETO };
}
