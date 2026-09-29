'use strict';

/**
 * A paleta.
 *
 * Duas decisoes, e as duas sao sobre legibilidade e nao sobre gosto.
 *
 * A primeira: os dois feromonios tem cores em lados OPOSTOS do circulo -- verde
 * para "tem comida por aqui", violeta para "por aqui se volta". Numa trilha ja
 * madura os dois campos ficam por cima um do outro, e cores vizinhas dariam um
 * borrao sem informacao. Opostas, a mistura vira um branco esverdeado que se le
 * de relance como "trilha nos dois sentidos".
 *
 * A segunda: o fundo e terra escura, e nao preto. Preto puro faz o feromonio
 * fraco desaparecer, e o feromonio fraco e justamente o que interessa -- e nele
 * que se ve a colonia procurando.
 */

const CORES = {
  terra: '#2A1F19',
  terraClara: '#3A2C23',

  comida: { r: 120, g: 230, b: 120 },
  casa: { r: 190, g: 120, b: 240 },

  formiga: '#F2E4D4',
  formigaCarregada: '#8FE87A',

  ninho: '#8C6440',
  ninhoBorda: '#C79A6B',

  monte: '#7ED957',
  monteVazio: '#4A4038',

  parede: '#151010',
  paredeTopo: '#241A15',
};

/** A cor de uma celula, misturando os dois campos pelo quanto ha em cada. */
function misturar(comida, casa, teto) {
  const a = Math.min(1, comida / teto);
  const b = Math.min(1, casa / teto);

  // A raiz quadrada e o que faz o cheiro fraco aparecer. Sem ela, a escala e
  // linear e os primeiros vinte por cento -- que sao a fase de procura, a mais
  // interessante -- ficam invisiveis.
  const forcaA = Math.sqrt(a);
  const forcaB = Math.sqrt(b);

  return {
    r: CORES.comida.r * forcaA + CORES.casa.r * forcaB,
    g: CORES.comida.g * forcaA + CORES.casa.g * forcaB,
    b: CORES.comida.b * forcaA + CORES.casa.b * forcaB,
    alfa: Math.min(0.92, forcaA * 0.8 + forcaB * 0.8),
  };
}

if (typeof module !== 'undefined') {
  module.exports = { CORES, misturar };
}
