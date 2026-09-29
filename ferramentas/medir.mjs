#!/usr/bin/env node

/**
 * Mede a colônia, em vez de olhar para ela e achar bonita.
 *
 *     node ferramentas/medir.mjs [minutos] [quantas-sementes]
 *
 * Uma simulação visual tem um problema de honestidade: ela sempre parece
 * funcionar. As formigas andam, o rastro aparece, alguma coisa acontece na tela,
 * e a impressão de que o algoritmo está certo vem de graça. Foi exatamente assim
 * que a primeira versão daqui passou — com **um campo de feromônio só**, as
 * formigas faziam um círculo lindo e não entregavam comida nenhuma.
 *
 * O juiz aqui é a geometria, que não depende de opinião: a distância em linha
 * reta entre o ninho e a comida. Uma trilha boa é uma em que a volta completa
 * encosta no dobro dessa distância (ida e volta), e a razão entre as duas é um
 * número que não dá para discutir.
 *
 * E há um segundo juiz, que é a mesma colônia com o feromônio desligado. Se as
 * formigas com trilha não acharem muito mais comida que as formigas cegas, o
 * mecanismo não está fazendo nada — e essa comparação é a única prova de que a
 * emergência é real e não decoração.
 */

import { Aleatorio } from '../js/aleatorio.js';
import { Grade } from '../js/mundo/grade.js';
import { Feromonio } from '../js/mundo/feromonio.js';
import { Cenario } from '../js/mundo/cenario.js';
import { Formiga } from '../js/formiga/formiga.js';
import * as sentidos from '../js/formiga/sentidos.js';
import * as decisao from '../js/formiga/decisao.js';
import { Colonia } from '../js/formiga/colonia.js';

const PASSO = 1 / 30;

const LARGURA = 1280;
const ALTURA = 720;

function montarCenario() {
  const cenario = new Cenario(LARGURA, ALTURA);

  // Dois montes: um perto e um longe. O de perto acaba primeiro, e ver a
  // colônia largar a trilha curta e refazer o trabalho para o monte distante é
  // o que este projeto tem de mais interessante.
  cenario.acrescentarMonte(LARGURA * 0.18, ALTURA * 0.28, 900, 34);
  cenario.acrescentarMonte(LARGURA * 0.84, ALTURA * 0.76, 900, 34);

  return cenario;
}

function rodar({ semente, segundos, comFeromonio }) {
  const cenario = montarCenario();

  const colonia = new Colonia({
    Grade, Feromonio, Formiga, sentidos, decisao, Aleatorio,
    largura: LARGURA, altura: ALTURA, quantas: 220, semente, cenario,
  });

  if (!comFeromonio) {
    // Desligar o feromônio é apagá-lo a cada passo: as formigas continuam
    // depositando e ninguém nunca lê nada. É o jeito de mudar uma coisa só.
    const evaporarDeVerdade = colonia.feromonio.evaporar.bind(colonia.feromonio);

    colonia.feromonio.evaporar = (dt) => {
      evaporarDeVerdade(dt);
      colonia.feromonio.limpar();
    };
  }

  const passos = Math.round(segundos / PASSO);
  const linhaDoTempo = [];

  for (let i = 0; i < passos; i += 1) {
    colonia.passo(PASSO);

    if (i % Math.round(30 / PASSO) === 0) {
      linhaDoTempo.push({
        minuto: colonia.tempo / 60,
        entregues: cenario.colhidas,
        caminho: colonia.caminhoMedio(),
      });
    }
  }

  return {
    entregues: cenario.colhidas,
    caminho: colonia.caminhoMedio(60),
    linhaDoTempo,
    reta: Math.min(...cenario.montes.map((m) => cenario.distanciaAte(m))),
    minimo: 2 * Math.min(...cenario.montes.map(
      (m) => cenario.distanciaAte(m) - cenario.ninho.raio - m.raio)),
    restante: cenario.comidaRestante,
  };
}

function media(valores) {
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function principal() {
  const minutos = Number(process.argv[2] || 4);
  const sementes = Number(process.argv[3] || 5);

  const segundos = minutos * 60;

  console.log(`${minutos} minuto(s) de simulação, ${sementes} sementes, `
    + '220 formigas, dois montes de 900');
  console.log();

  const com = [];
  const sem = [];

  for (let semente = 1; semente <= sementes; semente += 1) {
    com.push(rodar({ semente, segundos, comFeromonio: true }));
    sem.push(rodar({ semente, segundos, comFeromonio: false }));
  }

  const reta = com[0].reta;

  const entreguesCom = media(com.map((r) => r.entregues));
  const entreguesSem = media(sem.map((r) => r.entregues));
  const caminhoCom = media(com.map((r) => r.caminho));
  const caminhoSem = media(sem.map((r) => r.caminho));

  console.log('                        com trilha    sem trilha');
  console.log('-'.repeat(52));
  console.log(`comida entregue    ${entreguesCom.toFixed(0).padStart(12)}`
    + `${entreguesSem.toFixed(0).padStart(14)}`);
  console.log(`caminho por volta  ${caminhoCom.toFixed(0).padStart(12)}`
    + `${caminhoSem.toFixed(0).padStart(14)}  pixels`);
  console.log();

  const minimo = com[0].minimo;

  console.log(`a linha reta ninho -> monte mais perto:  ${reta.toFixed(0)} pixels`);
  console.log(`o minimo possivel para a volta inteira:  ${minimo.toFixed(0)} pixels`);
  console.log('  (ida e volta, descontando o raio do ninho e o do monte)');
  console.log();

  const vezes = entreguesSem > 0 ? entreguesCom / entreguesSem : Infinity;
  const desvio = caminhoCom / minimo;

  console.log(`a trilha entrega ${vezes.toFixed(1)}x mais comida que o acaso`);
  console.log(`e a volta media custa ${desvio.toFixed(2)}x o minimo geometrico`);
  console.log();

  console.log('como foi ao longo do tempo (com trilha, media das sementes):');
  console.log();
  console.log('  minuto   entregues   caminho medio');

  const quantosPontos = com[0].linhaDoTempo.length;

  for (let i = 0; i < quantosPontos; i += 2) {
    const minuto = com[0].linhaDoTempo[i].minuto;
    const entregues = media(com.map((r) => r.linhaDoTempo[i].entregues));
    const caminho = media(com.map((r) => r.linhaDoTempo[i].caminho));

    const barra = '#'.repeat(Math.round(entregues / 20));

    console.log(`  ${minuto.toFixed(1).padStart(6)}   ${entregues.toFixed(0).padStart(9)}`
      + `   ${caminho.toFixed(0).padStart(13)}  ${barra}`);
  }

  const bom = vezes >= 2 && desvio <= 3;

  console.log();
  console.log(bom
    ? 'a colonia funciona: a trilha vale a pena e o caminho e razoavel.'
    : 'a colonia NAO esta funcionando como devia.');

  return bom ? 0 : 1;
}

process.exitCode = principal();
