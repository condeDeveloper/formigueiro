'use strict';

/**
 * O que existe no mundo alem do cheiro: o ninho, a comida e as paredes.
 *
 * A comida acaba. Isso parece obvio e muda a simulacao inteira: uma fonte
 * infinita da uma trilha que se estabiliza e fica igual para sempre, que e
 * bonito e nao ensina nada. Com a fonte acabando, a colonia tem de LARGAR a
 * trilha boa e achar outra -- e ver isso acontecer, com a trilha velha
 * evaporando enquanto a nova se forma, e a coisa mais interessante que este
 * projeto tem para mostrar.
 */

const RAIO_DO_NINHO = 26;

class Monte {

  constructor(x, y, quanto, raio) {
    this.x = x;
    this.y = y;

    this.inicial = quanto;
    this.quanto = quanto;
    this.raio = raio;
  }

  get acabou() {
    return this.quanto <= 0;
  }

  get fracao() {
    return this.inicial === 0 ? 0 : this.quanto / this.inicial;
  }

  contem(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;

    return dx * dx + dy * dy <= this.raio * this.raio;
  }

  tirarUm() {
    if (this.acabou) {
      return false;
    }

    this.quanto -= 1;

    return true;
  }
}

class Parede {

  constructor(x, y, largura, altura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;
  }

  contem(x, y) {
    return x >= this.x && x < this.x + this.largura
      && y >= this.y && y < this.y + this.altura;
  }
}

class Cenario {

  constructor(largura, altura) {
    this.largura = largura;
    this.altura = altura;

    this.ninho = { x: largura * 0.5, y: altura * 0.5, raio: RAIO_DO_NINHO };
    this.montes = [];
    this.paredes = [];

    this.colhidas = 0;
  }

  acrescentarMonte(x, y, quanto, raio) {
    this.montes.push(new Monte(x, y, quanto, raio));

    return this;
  }

  acrescentarParede(x, y, largura, altura) {
    this.paredes.push(new Parede(x, y, largura, altura));

    return this;
  }

  noNinho(x, y) {
    const dx = x - this.ninho.x;
    const dy = y - this.ninho.y;

    return dx * dx + dy * dy <= this.ninho.raio * this.ninho.raio;
  }

  emParede(x, y) {
    for (const parede of this.paredes) {
      if (parede.contem(x, y)) {
        return true;
      }
    }

    return false;
  }

  /** Tira uma unidade de comida de onde a formiga esta, se houver. */
  colherEm(x, y) {
    for (const monte of this.montes) {
      if (!monte.acabou && monte.contem(x, y) && monte.tirarUm()) {
        return monte;
      }
    }

    return null;
  }

  guardar() {
    this.colhidas += 1;
  }

  get comidaRestante() {
    let total = 0;

    for (const monte of this.montes) {
      total += monte.quanto;
    }

    return total;
  }

  /** A distancia em linha reta do ninho ate um monte. E a medida de comparacao. */
  distanciaAte(monte) {
    const dx = monte.x - this.ninho.x;
    const dy = monte.y - this.ninho.y;

    return Math.hypot(dx, dy);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Cenario, Monte, Parede, RAIO_DO_NINHO };
}
