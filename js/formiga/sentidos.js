'use strict';

/**
 * O que uma formiga enxerga: tres pontos a frente, e mais nada.
 *
 * Esta e a parte que surpreende quem ve a simulacao funcionando. A trilha que
 * aparece na tela parece planejada, e nenhuma formiga tem plano nenhum. Ela
 * cheira tres pontos -- um a esquerda, um em frente, um a direita, todos a
 * meia dezena de pixels do nariz -- e escolhe entre eles. Nao ha mapa, nao ha
 * memoria do caminho, nao ha comunicacao direta entre formigas.
 *
 * O unico canal de comunicacao e o chao. Uma formiga muda o ambiente; outra,
 * minutos depois, le a mudanca. Isso tem nome desde 1959: estigmergia, de
 * Pierre-Paul Grasse, que estudava cupins e precisava explicar como eles
 * constroem juntos uma coisa que nenhum deles conhece.
 */

const ALCANCE = 14;
const ABERTURA = Math.PI / 3.6;

/** Os tres pontos que a formiga cheira, a partir da posicao e do angulo. */
function pontos(x, y, angulo) {
  return [
    ponto(x, y, angulo - ABERTURA),
    ponto(x, y, angulo),
    ponto(x, y, angulo + ABERTURA),
  ];
}

function ponto(x, y, direcao) {
  return {
    x: x + Math.cos(direcao) * ALCANCE,
    y: y + Math.sin(direcao) * ALCANCE,
    direcao,
  };
}

/**
 * Quanto cheiro ha em cada um dos tres pontos.
 *
 * Um ponto dentro de uma parede ou fora do mundo devolve -1, e quem decide
 * trata isso como "nao da para ir". Devolver zero seria dizer "nao tem cheiro
 * ali", que e diferente: sem cheiro nenhum a formiga ainda pode escolher o
 * caminho, e dentro de uma parede nao.
 */
function cheirar(formiga, feromonio, cenario, qual) {
  const lidos = [];

  for (const alvo of pontos(formiga.x, formiga.y, formiga.angulo)) {
    if (!cenario || cenario.emParede(alvo.x, alvo.y)
        || !feromonio.grade.dentro(alvo.x, alvo.y)) {
      lidos.push({ ...alvo, cheiro: -1 });
      continue;
    }

    lidos.push({ ...alvo, cheiro: feromonio.lerEm(alvo.x, alvo.y, qual) });
  }

  return lidos;
}

/** Enxerga um monte de comida, ou o ninho, dentro do alcance de vista. */
const VISTA = 42;

function enxerga(formiga, alvoX, alvoY) {
  const dx = alvoX - formiga.x;
  const dy = alvoY - formiga.y;

  return dx * dx + dy * dy <= VISTA * VISTA;
}

if (typeof module !== 'undefined') {
  module.exports = { cheirar, pontos, enxerga, ALCANCE, ABERTURA, VISTA };
}
