'use strict';

/**
 * A colonia: as formigas, o cheiro, o cenario, e o passo de tempo.
 *
 * Esta classe e o que as ferramentas de medida rodam sem navegador nenhum --
 * ela nao sabe o que e um canvas, nao sabe o que e um quadro, e so avanca o
 * tempo. E o que permite medir a simulacao em vez de olhar para ela e achar
 * bonita.
 */

class Colonia {

  constructor(opcoes) {
    const {
      Grade, Feromonio, Formiga, sentidos, decisao, Aleatorio,
      largura = 1280, altura = 720, quantas = 220, semente = 1,
      cenario,
    } = opcoes;

    this.sorteio = new Aleatorio(semente);
    this.grade = new Grade(largura, altura);
    this.feromonio = new Feromonio(this.grade);
    this.cenario = cenario;

    this.sentidos = sentidos;
    this.decisao = decisao;

    this.formigas = [];

    for (let i = 0; i < quantas; i += 1) {
      this.formigas.push(new Formiga(
        cenario.ninho.x,
        cenario.ninho.y,
        this.sorteio.entre(0, Math.PI * 2),
        this.sorteio,
      ));
    }

    this.tempo = 0;

    // As voltas completas, com o quanto cada uma andou. E a medida principal:
    // uma trilha boa e uma em que este numero encosta na distancia em linha
    // reta.
    this.voltas = [];
  }

  /**
   * Avanca a simulacao.
   *
   * O passo e FIXO, e nao o tempo que o navegador levou para desenhar o quadro
   * anterior. Com passo variavel, a simulacao roda diferente num computador
   * rapido e num lento -- e ai a medida de uma maquina nao vale na outra, o que
   * destroi a unica coisa que este projeto tem de solido.
   */
  passo(segundos) {
    this.tempo += segundos;

    for (const formiga of this.formigas) {
      const aconteceu = this.decisao.passo(
        formiga, this.feromonio, this.cenario, this.sentidos, segundos);

      if (aconteceu && aconteceu.tipo === 'entregou') {
        this.voltas.push({ quando: this.tempo, andou: aconteceu.andou });
      }
    }

    this.feromonio.evaporar(segundos);
  }

  /** Quantas entregas por minuto nos ultimos `janela` segundos. */
  ritmo(janela = 30) {
    const desde = this.tempo - janela;
    const recentes = this.voltas.filter((volta) => volta.quando >= desde);

    return recentes.length * (60 / janela);
  }

  /** Quanto as ultimas `quantas` voltas andaram, em media. */
  caminhoMedio(quantas = 40) {
    const ultimas = this.voltas.slice(-quantas);

    if (ultimas.length === 0) {
      return 0;
    }

    let soma = 0;

    for (const volta of ultimas) {
      soma += volta.andou;
    }

    return soma / ultimas.length;
  }

  get carregando() {
    let quantas = 0;

    for (const formiga of this.formigas) {
      if (formiga.carregando) {
        quantas += 1;
      }
    }

    return quantas;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Colonia };
}
