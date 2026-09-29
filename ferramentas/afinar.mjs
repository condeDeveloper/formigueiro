#!/usr/bin/env node

/**
 * Varre um parâmetro e mostra o efeito dele, em vez de eu adivinhar.
 *
 *     node ferramentas/afinar.mjs acaso
 *     node ferramentas/afinar.mjs expoente
 *     node ferramentas/afinar.mjs evaporacao
 *     node ferramentas/afinar.mjs formigas
 *
 * Toda constante deste projeto passou por aqui. A alternativa é mexer no
 * número, olhar a tela, achar que melhorou e seguir — e "achar que melhorou"
 * numa simulação em que tudo é probabilístico não vale nada: duas rodadas da
 * mesma versão já parecem diferentes.
 *
 * Os dois números que saem são os mesmos do `medir.mjs`: quanta comida entrou,
 * e quanto a volta custa em relação à linha reta. Os dois juntos, porque
 * otimizar um só dá respostas erradas — uma colônia que faz voltas curtíssimas
 * e quase nunca acha comida tem uma eficiência ótima e é inútil.
 */

import { Aleatorio } from '../js/aleatorio.js';
import { Grade } from '../js/mundo/grade.js';
import { Feromonio } from '../js/mundo/feromonio.js';
import { Cenario } from '../js/mundo/cenario.js';
import { Formiga } from '../js/formiga/formiga.js';
import * as sentidos from '../js/formiga/sentidos.js';
import * as decisaoOriginal from '../js/formiga/decisao.js';
import { Colonia } from '../js/formiga/colonia.js';

const PASSO = 1 / 30;
const LARGURA = 1280;
const ALTURA = 720;

const VARREDURAS = {
  acaso: {
    conta: 'a chance de ignorar o cheiro e ir para qualquer lado',
    valores: [0, 0.01, 0.03, 0.08, 0.2, 0.5],
    atual: decisaoOriginal.ACASO,
  },
  expoente: {
    conta: 'a teimosia: 1 segue de leve, 3 e quase obediencia cega',
    valores: [0.5, 1, 1.5, 2, 3, 5],
    atual: decisaoOriginal.EXPOENTE,
  },
  evaporacao: {
    conta: 'quanto do cheiro some por segundo -- o esquecimento do sistema',
    valores: [0.02, 0.06, 0.12, 0.25, 0.5],
    atual: 0.12,
  },
  formigas: {
    conta: 'quantas formigas na colonia',
    valores: [40, 90, 150, 220, 400],
    atual: 220,
  },
};

function montarCenario() {
  const cenario = new Cenario(LARGURA, ALTURA);

  cenario.acrescentarMonte(LARGURA * 0.18, ALTURA * 0.28, 900, 34);
  cenario.acrescentarMonte(LARGURA * 0.84, ALTURA * 0.76, 900, 34);

  return cenario;
}

/**
 * Roda uma colônia com um parâmetro trocado.
 *
 * Trocar `ACASO` e `EXPOENTE` exige reimplementar a escolha — eles são
 * constantes do módulo, e é assim que devem ser no código que roda de verdade.
 * Uma constante que vira opção de configuração para o teste poder mexer nela é
 * uma constante que deixou de ser constante.
 */
function rodar({ qual, valor, semente, segundos }) {
  const cenario = montarCenario();

  const decisao = qual === 'acaso' || qual === 'expoente'
    ? comEscolhaTrocada(qual, valor)
    : decisaoOriginal;

  const colonia = new Colonia({
    Grade, Feromonio, Formiga, sentidos, decisao, Aleatorio,
    largura: LARGURA, altura: ALTURA,
    quantas: qual === 'formigas' ? valor : 220,
    semente, cenario,
  });

  if (qual === 'evaporacao') {
    colonia.feromonio.evaporar = (dt) => {
      const fator = Math.pow(1 - valor, dt);

      for (let i = 0; i < colonia.feromonio.deComida.length; i += 1) {
        colonia.feromonio.deComida[i] *= fator;
        colonia.feromonio.deCasa[i] *= fator;
      }
    };
  }

  const passos = Math.round(segundos / PASSO);

  for (let i = 0; i < passos; i += 1) {
    colonia.passo(PASSO);
  }

  const minimo = 2 * Math.min(...cenario.montes.map(
    (monte) => cenario.distanciaAte(monte) - cenario.ninho.raio - monte.raio));

  return {
    entregues: cenario.colhidas,
    eficiencia: colonia.caminhoMedio(60) / minimo,
  };
}

function comEscolhaTrocada(qual, valor) {
  const acaso = qual === 'acaso' ? valor : decisaoOriginal.ACASO;
  const expoente = qual === 'expoente' ? valor : decisaoOriginal.EXPOENTE;

  function escolherDirecao(formiga, feromonio, cenario) {
    const lidos = sentidos.cheirar(formiga, feromonio, cenario, formiga.qualProcura);
    const possiveis = lidos.filter((lido) => lido.cheiro >= 0);

    if (possiveis.length === 0) {
      return formiga.angulo + Math.PI * (0.5 + formiga.sorteio.numero());
    }

    if (formiga.sorteio.chance(acaso)) {
      return possiveis[formiga.sorteio.ate(possiveis.length)].direcao;
    }

    const pesos = possiveis.map((lido) => Math.pow(lido.cheiro, expoente));
    const soma = pesos.reduce((a, b) => a + b, 0);

    if (soma <= 0) {
      return formiga.angulo
        + formiga.sorteio.entre(-decisaoOriginal.TREMOR, decisaoOriginal.TREMOR);
    }

    return possiveis[formiga.sorteio.peloPeso(pesos)].direcao;
  }

  return {
    escolherDirecao,
    passo(formiga, feromonio, cenario, osSentidos, segundos) {
      // A escolha trocada vai como sexto argumento. Sem ela ali, o `passo`
      // usaria a de sempre e a varredura mediria a mesma coisa em toda linha.
      return decisaoOriginal.passo(
        formiga, feromonio, cenario, osSentidos, segundos, escolherDirecao);
    },
  };
}

function media(valores) {
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function principal() {
  const qual = process.argv[2];
  const varredura = VARREDURAS[qual];

  if (!varredura) {
    console.log('varreduras disponíveis:');
    console.log();

    for (const [nome, item] of Object.entries(VARREDURAS)) {
      console.log(`  ${nome.padEnd(12)} ${item.conta}`);
    }

    return 1;
  }

  const segundos = Number(process.argv[3] || 150);
  const sementes = Number(process.argv[4] || 3);

  console.log(`varrendo "${qual}": ${varredura.conta}`);
  console.log(`${segundos}s de simulação, ${sementes} sementes por valor`);
  console.log();
  console.log('   valor   entregues   volta/minimo');
  console.log('-'.repeat(52));

  for (const valor of varredura.valores) {
    const rodadas = [];

    for (let semente = 1; semente <= sementes; semente += 1) {
      rodadas.push(rodar({ qual, valor, semente, segundos }));
    }

    const entregues = media(rodadas.map((r) => r.entregues));
    const eficiencia = media(rodadas.map((r) => r.eficiencia));

    const marca = valor === varredura.atual ? '  <- o que esta no codigo' : '';
    const barra = '#'.repeat(Math.round(entregues / 25));

    console.log(`  ${String(valor).padStart(6)}   ${entregues.toFixed(0).padStart(9)}`
      + `   ${eficiencia.toFixed(2).padStart(12)}  ${barra}${marca}`);
  }

  return 0;
}

process.exitCode = principal();
