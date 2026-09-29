'use strict';

/**
 * Como uma formiga escolhe para onde ir.
 *
 * Sao cinco regras, nesta ordem, e o sistema inteiro sai delas:
 *
 *   1. Se vejo o que procuro, vou direto nele.
 *   2. Se ha cheiro a frente, escolho entre os tres pontos com probabilidade
 *      proporcional ao cheiro.
 *   3. Se nao ha cheiro nenhum, sigo em frente com um tremor.
 *   4. Se bati numa parede ou na borda, viro.
 *   5. Sempre um pouquinho de acaso, mesmo quando a trilha e forte.
 *
 * A regra 5 e a que parece errada e e essencial. Sem ela, a colonia acha a
 * primeira trilha e nunca mais sai dela: a trilha se reforca sozinha, e
 * qualquer atalho fica sem ninguem para descobri-lo. Com 3% de acaso, umas
 * poucas formigas se desgarram o tempo todo, e sao elas que acham o caminho
 * curto -- que entao vence sozinho, porque e mais curto e o cheiro nele
 * evapora menos antes da proxima passar.
 *
 * O expoente da regra 2 e o botao de teimosia. Com 1, a formiga segue o cheiro
 * de leve; com 3, ela e quase determinista. Ele esta em 2 porque foi o que
 * mediu melhor -- e "mediu melhor" aqui quer dizer numero, em ferramentas/.
 */

const ACASO = 0.03;
const EXPOENTE = 2;

/** O tremor de quem anda sem cheiro nenhum para seguir. */
const TREMOR = 0.9;

function escolherDirecao(formiga, feromonio, cenario, sentidos) {
  const lidos = sentidos.cheirar(formiga, feromonio, cenario, formiga.qualProcura);

  const possiveis = lidos.filter((lido) => lido.cheiro >= 0);

  // Encurralada: nao ha para onde ir a frente. Vira de vez.
  if (possiveis.length === 0) {
    return formiga.angulo + Math.PI * (0.5 + formiga.sorteio.numero());
  }

  if (formiga.sorteio.chance(ACASO)) {
    const qualquer = possiveis[formiga.sorteio.ate(possiveis.length)];

    return qualquer.direcao;
  }

  const pesos = possiveis.map((lido) => Math.pow(lido.cheiro, EXPOENTE));

  let soma = 0;

  for (const peso of pesos) {
    soma += peso;
  }

  if (soma <= 0) {
    // Nenhum cheiro por perto: segue em frente, torto. O tremor e o que faz a
    // busca cobrir area em vez de virar uma linha reta ate a parede.
    return formiga.angulo + formiga.sorteio.entre(-TREMOR, TREMOR);
  }

  return possiveis[formiga.sorteio.peloPeso(pesos)].direcao;
}

/**
 * O passo inteiro de uma formiga.
 *
 * Devolve o que aconteceu, para quem estiver medindo: 'pegou', 'entregou' ou
 * nada.
 *
 * O ultimo parametro e a funcao de escolha, e ela e parametro por um motivo
 * pratico: a ferramenta de afinacao troca o acaso e a teimosia por outros
 * valores e precisa que a troca CHEGUE ate aqui. A primeira versao da
 * ferramenta montava a escolha nova e o `passo` continuava chamando a de
 * sempre -- a varredura rodava, imprimia numeros bonitos e media a mesma coisa
 * seis vezes.
 */
function passo(formiga, feromonio, cenario, sentidos, segundos,
  escolher = escolherDirecao) {
  formiga.folego -= segundos;

  // Regra 1: o que procuro esta a vista.
  if (formiga.carregando) {
    if (sentidos.enxerga(formiga, cenario.ninho.x, cenario.ninho.y)) {
      formiga.virarPara(
        Math.atan2(cenario.ninho.y - formiga.y, cenario.ninho.x - formiga.x),
        segundos);
    } else {
      formiga.virarPara(
        escolher(formiga, feromonio, cenario, sentidos), segundos);
    }
  } else {
    const alvo = monteAVista(formiga, cenario, sentidos);

    if (alvo) {
      formiga.virarPara(Math.atan2(alvo.y - formiga.y, alvo.x - formiga.x), segundos);
    } else {
      formiga.virarPara(
        escolher(formiga, feromonio, cenario, sentidos), segundos);
    }
  }

  const antesX = formiga.x;
  const antesY = formiga.y;

  formiga.andar(segundos);

  // Regra 4: bateu, volta e vira.
  if (!feromonio.grade.dentro(formiga.x, formiga.y)
      || cenario.emParede(formiga.x, formiga.y)) {
    formiga.x = antesX;
    formiga.y = antesY;
    formiga.angulo += Math.PI * (0.5 + formiga.sorteio.numero());

    return null;
  }

  feromonio.depositar(formiga.x, formiga.y, formiga.qualDeposita,
    formiga.quantoDeposita(segundos));

  if (!formiga.carregando) {
    const monte = cenario.colherEm(formiga.x, formiga.y);

    if (monte) {
      formiga.carregando = true;
      formiga.angulo += Math.PI;
      formiga.recomecarFolego();

      return 'pegou';
    }

    return null;
  }

  if (cenario.noNinho(formiga.x, formiga.y)) {
    formiga.carregando = false;
    formiga.angulo += Math.PI;

    const andou = formiga.andou;

    formiga.recomecarFolego();
    formiga.recomecarConta();
    cenario.guardar();

    return { tipo: 'entregou', andou };
  }

  return null;
}

function monteAVista(formiga, cenario, sentidos) {
  for (const monte of cenario.montes) {
    if (!monte.acabou && sentidos.enxerga(formiga, monte.x, monte.y)) {
      return monte;
    }
  }

  return null;
}

if (typeof module !== 'undefined') {
  module.exports = { escolherDirecao, passo, ACASO, EXPOENTE, TREMOR };
}
