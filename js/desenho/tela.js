'use strict';

/**
 * O canvas, em alta densidade.
 *
 * Uma formiga tem tres pixels de largura. Num monitor comum ela e um borrao de
 * tres pixels; numa tela de retina, se o canvas nao souber disso, ela e o mesmo
 * borrao esticado -- pior ainda.
 *
 * A saida e desenhar num canvas com o dobro ou o triplo de pixels e deixar o
 * navegador encolher. O `scale` no fim faz o resto do codigo continuar
 * trabalhando em coordenadas logicas, sem saber de nada disso.
 *
 * O teto de 3 existe porque acima disso o ganho e invisivel e o custo nao: um
 * canvas de densidade 4 tem dezesseis vezes mais pixels que um de densidade 1.
 */

class Tela {

  constructor(canvas, largura, altura) {
    this.canvas = canvas;
    this.largura = largura;
    this.altura = altura;

    const densidade = Math.min(3, Math.max(1, window.devicePixelRatio || 1));

    canvas.width = Math.round(largura * densidade);
    canvas.height = Math.round(altura * densidade);

    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;

    this.pincel = canvas.getContext('2d');
    this.pincel.scale(densidade, densidade);

    this.densidade = densidade;
  }

  limpar(cor) {
    this.pincel.fillStyle = cor;
    this.pincel.fillRect(0, 0, this.largura, this.altura);
  }
}
