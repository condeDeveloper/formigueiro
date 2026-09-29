'use strict';

/**
 * Onde tudo se encontra: monta o mundo, roda o relogio, desenha.
 *
 * As pecas sao as mesmas que a ferramenta de medida usa -- `Colonia`, `Cenario`,
 * `Feromonio` --, e este arquivo so acrescenta o que e do navegador: o canvas,
 * os botoes e o laco de quadros. E o que garante que o que se ve na tela e
 * exatamente o que foi medido.
 */

const LARGURA = 1280;
const ALTURA = 720;
const QUANTAS = 220;

function montarCenario() {
  const cenario = new Cenario(LARGURA, ALTURA);

  cenario.acrescentarMonte(LARGURA * 0.18, ALTURA * 0.28, 900, 34);
  cenario.acrescentarMonte(LARGURA * 0.84, ALTURA * 0.76, 900, 34);

  cenario.acrescentarParede(LARGURA * 0.36, ALTURA * 0.10, 22, ALTURA * 0.34);
  cenario.acrescentarParede(LARGURA * 0.62, ALTURA * 0.56, 22, ALTURA * 0.34);

  return cenario;
}

function novaColonia(semente) {
  const cenario = montarCenario();

  return new Colonia({
    Grade, Feromonio, Formiga, Aleatorio,
    sentidos: { cheirar, pontos, enxerga },
    decisao: { passo, escolherDirecao },
    largura: LARGURA, altura: ALTURA, quantas: QUANTAS, semente, cenario,
  });
}

function comecar() {
  const canvas = document.getElementById('tela');
  const tela = new Tela(canvas, LARGURA, ALTURA);
  const painel = new Painel(document.getElementById('painel'));
  const relogio = new Relogio();

  let semente = 1;
  let colonia = novaColonia(semente);
  let mostrandoCheiro = true;

  const minimo = 2 * Math.min(...colonia.cenario.montes.map(
    (monte) => colonia.cenario.distanciaAte(monte)
      - colonia.cenario.ninho.raio - monte.raio));

  document.getElementById('recomecar').addEventListener('click', () => {
    semente += 1;
    colonia = novaColonia(semente);
    relogio.acumulado = 0;
  });

  document.getElementById('cheiro').addEventListener('click', (evento) => {
    mostrandoCheiro = !mostrandoCheiro;
    evento.target.textContent = mostrandoCheiro ? 'esconder o cheiro' : 'mostrar o cheiro';
  });

  for (const botao of document.querySelectorAll('[data-velocidade]')) {
    botao.addEventListener('click', () => {
      relogio.velocidade = Number(botao.dataset.velocidade);

      for (const outro of document.querySelectorAll('[data-velocidade]')) {
        outro.classList.toggle('escolhido', outro === botao);
      }
    });
  }

  function quadro(agora) {
    const passos = relogio.passos(agora);

    for (let i = 0; i < passos; i += 1) {
      colonia.passo(PASSO);
    }

    tela.limpar(CORES.terra);

    if (mostrandoCheiro) {
      desenharFeromonio(tela, colonia.feromonio, { misturar, CORES }, TETO);
    }

    desenharCenario(tela, colonia.cenario, { CORES });
    desenharFormigas(tela, colonia.formigas, { CORES });

    painel.mostrar(colonia, minimo);

    requestAnimationFrame(quadro);
  }

  requestAnimationFrame(quadro);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', comecar);
}
